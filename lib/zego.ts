/**
 * ZegoCloud Video Calling Integration
 * Handles token generation and video call setup
 */

import { useState } from 'react';
import { ZegoExpressEngine } from 'zego-express-engine-webrtc';

const APP_ID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID || '0');
const SERVER_SECRET = process.env.ZEGO_SERVER_SECRET || '';

// Token generation (server-side)
export const generateZegoToken = async (
  userId: string,
  roomId: string,
  role: 'admin' | 'publisher' | 'audience' = 'publisher'
): Promise<{ token: string; expires_at: number }> => {
  // This should be called from server-side API route
  const payload = {
    iss: APP_ID,
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiry
    iat: Math.floor(Date.now() / 1000),
    aud: 'zego',
    jti: Math.random().toString(36).substring(2),
    user_id: userId,
    room_id: roomId,
    privilege: {
      1: role === 'admin' ? 1 : 0, // Login room
      2: role === 'publisher' || role === 'admin' ? 1 : 0, // Publish stream
    },
  };

  // In a real implementation, you would use a JWT library to sign this
  // For now, this is a placeholder - the actual token generation happens in the API route
  return {
    token: 'placeholder_token',
    expires_at: payload.exp,
  };
};

// Zego Engine wrapper class
export class ZegoVideoCall {
  private zg: ZegoExpressEngine | null = null;
  private localStream: MediaStream | null = null;
  private isJoined = false;

  constructor(
    private appId: number,
    private server: string = 'wss://webliveroom-api.zego.im/ws'
  ) {}

  // Initialize Zego Engine
  async init(): Promise<void> {
    if (this.zg) return;

    this.zg = new ZegoExpressEngine(this.appId, this.server);
    
    // Set up event listeners
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.zg) return;

    // Room state updates
    this.zg.on('roomStateUpdate', (roomID, state, errorCode, extendedData) => {
      console.log('Room state update:', { roomID, state, errorCode });
      if (state === 'CONNECTED') {
        this.isJoined = true;
      } else if (state === 'DISCONNECTED') {
        this.isJoined = false;
      }
    });

    // User state updates
    this.zg.on('roomUserUpdate', (roomID, updateType, userList) => {
      console.log('Room user update:', { roomID, updateType, userList });
    });

    // Stream updates
    this.zg.on('roomStreamUpdate', async (roomID, updateType, streamList) => {
      console.log('Stream update:', { roomID, updateType, streamList });
      
      if (updateType === 'ADD') {
        // Auto-play remote streams
        for (const stream of streamList) {
          await this.playRemoteStream(stream.streamID);
        }
      }
    });

    // Network quality
    this.zg.on('networkQuality', (userID, upstreamQuality, downstreamQuality) => {
      console.log('Network quality:', { userID, upstreamQuality, downstreamQuality });
    });
  }

  // Join room with token
  async joinRoom(
    roomId: string,
    token: string,
    userId: string,
    userName: string
  ): Promise<void> {
    if (!this.zg) throw new Error('Zego engine not initialized');

    const user = { userID: userId, userName };
    
    try {
      await this.zg.loginRoom(roomId, token, user);
      console.log('Successfully joined room:', roomId);
    } catch (error) {
      console.error('Failed to join room:', error);
      throw error;
    }
  }

  // Start local video/audio
  async startLocalStream(
    videoElementId: string,
    config: {
      video: boolean;
      audio: boolean;
      videoQuality?: 'low' | 'medium' | 'high';
    } = { video: true, audio: true }
  ): Promise<void> {
    if (!this.zg) throw new Error('Zego engine not initialized');

    try {
      // Create local stream
      const constraints = {
        camera: {
          audio: config.audio,
          video: config.video ? {
            width: config.videoQuality === 'high' ? 1280 : config.videoQuality === 'medium' ? 640 : 320,
            height: config.videoQuality === 'high' ? 720 : config.videoQuality === 'medium' ? 480 : 240,
            frameRate: 15,
            bitrate: config.videoQuality === 'high' ? 1200 : config.videoQuality === 'medium' ? 800 : 400,
          } : false,
        },
      };

      this.localStream = await this.zg.createStream(constraints);
      
      // Play local stream
      const videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
      if (videoElement) {
        this.zg.startPublishingStream(`${Date.now()}`, this.localStream);
        videoElement.srcObject = this.localStream;
        videoElement.play();
      }

      console.log('Local stream started');
    } catch (error) {
      console.error('Failed to start local stream:', error);
      throw error;
    }
  }

  // Play remote stream
  async playRemoteStream(streamId: string, videoElementId?: string): Promise<void> {
    if (!this.zg) throw new Error('Zego engine not initialized');

    try {
      const remoteStream = await this.zg.startPlayingStream(streamId);
      
      if (videoElementId) {
        const videoElement = document.getElementById(videoElementId) as HTMLVideoElement;
        if (videoElement) {
          videoElement.srcObject = remoteStream;
          videoElement.play();
        }
      }

      console.log('Remote stream playing:', streamId);
    } catch (error) {
      console.error('Failed to play remote stream:', error);
      throw error;
    }
  }

  // Toggle video
  async toggleVideo(enabled: boolean): Promise<void> {
    if (!this.zg || !this.localStream) return;

    try {
      await this.zg.mutePublishStreamVideo(!enabled);
      console.log('Video toggled:', enabled);
    } catch (error) {
      console.error('Failed to toggle video:', error);
    }
  }

  // Toggle audio
  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.zg || !this.localStream) return;

    try {
      await this.zg.mutePublishStreamAudio(!enabled);
      console.log('Audio toggled:', enabled);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
    }
  }

  // Leave room and cleanup
  async leaveRoom(): Promise<void> {
    if (!this.zg) return;

    try {
      if (this.localStream) {
        await this.zg.stopPublishingStream();
        this.zg.destroyStream(this.localStream);
        this.localStream = null;
      }

      if (this.isJoined) {
        await this.zg.logoutRoom();
        this.isJoined = false;
      }

      console.log('Left room successfully');
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }

  // Destroy engine
  destroy(): void {
    if (this.zg) {
      this.zg.destroyEngine();
      this.zg = null;
    }
  }

  // Get connection stats
  async getStats(): Promise<any> {
    if (!this.zg) return null;

    try {
      // Get network quality and other stats
      return {
        isConnected: this.isJoined,
        hasLocalStream: !!this.localStream,
        // Add more stats as needed
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }
}

// React hook for video calling
export const useZegoVideoCall = () => {
  const [zegoCall, setZegoCall] = useState<ZegoVideoCall | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [localStreamActive, setLocalStreamActive] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<string[]>([]);

  const initializeZego = async () => {
    if (zegoCall) return;

    const call = new ZegoVideoCall(APP_ID);
    await call.init();
    setZegoCall(call);
    setIsInitialized(true);
  };

  const joinRoom = async (roomId: string, token: string, userId: string, userName: string) => {
    if (!zegoCall) throw new Error('Zego not initialized');
    
    await zegoCall.joinRoom(roomId, token, userId, userName);
    setIsJoined(true);
  };

  const startLocalVideo = async (videoElementId: string, config?: any) => {
    if (!zegoCall) throw new Error('Zego not initialized');
    
    await zegoCall.startLocalStream(videoElementId, config);
    setLocalStreamActive(true);
  };

  const leaveRoom = async () => {
    if (!zegoCall) return;
    
    await zegoCall.leaveRoom();
    setIsJoined(false);
    setLocalStreamActive(false);
    setRemoteStreams([]);
  };

  const cleanup = () => {
    if (zegoCall) {
      zegoCall.destroy();
      setZegoCall(null);
      setIsInitialized(false);
      setIsJoined(false);
      setLocalStreamActive(false);
      setRemoteStreams([]);
    }
  };

  return {
    zegoCall,
    isInitialized,
    isJoined,
    localStreamActive,
    remoteStreams,
    initializeZego,
    joinRoom,
    startLocalVideo,
    leaveRoom,
    cleanup,
  };
};

// Low-bandwidth fallback options
export const getLowBandwidthConfig = () => ({
  video: true,
  audio: true,
  videoQuality: 'low' as const,
});

export const getAudioOnlyConfig = () => ({
  video: false,
  audio: true,
});

// Network quality assessment
export const assessNetworkQuality = async (): Promise<'good' | 'fair' | 'poor'> => {
  // Simple network quality check
  const startTime = Date.now();
  
  try {
    await fetch('/api/ping', { method: 'HEAD' });
    const latency = Date.now() - startTime;
    
    if (latency < 100) return 'good';
    if (latency < 300) return 'fair';
    return 'poor';
  } catch {
    return 'poor';
  }
};