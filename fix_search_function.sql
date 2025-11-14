-- Fix the search function to include user names
-- Run this in Supabase SQL Editor

-- First drop the existing function
DROP FUNCTION IF EXISTS search_caregivers_by_symptoms(text[], double precision, double precision, integer, text);

-- Now create the new function with user names
CREATE OR REPLACE FUNCTION search_caregivers_by_symptoms(
  search_symptoms text[],
  user_latitude double precision DEFAULT NULL,
  user_longitude double precision DEFAULT NULL,
  max_distance_km integer DEFAULT 50,
  caregiver_type text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  first_name text,
  last_name text,
  type text,
  specializations text[],
  qualifications text[],
  experience_years integer,
  languages text[],
  bio_en text,
  bio_hi text,
  profile_image_url text,
  rating numeric,
  total_reviews integer,
  consultation_fee numeric,
  home_visit_fee numeric,
  available_for_home_visits boolean,
  available_for_online boolean,
  latitude double precision,
  longitude double precision,
  service_radius_km integer,
  center_id uuid,
  distance_km double precision,
  match_score integer,
  matched_specializations text[]
) AS $$
BEGIN
  RETURN QUERY
  WITH symptom_matches AS (
    SELECT 
      c.*,
      u.first_name,
      u.last_name,
      -- Calculate distance if coordinates provided
      CASE 
        WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL 
        THEN ST_Distance(
          ST_Point(c.longitude, c.latitude)::geography,
          ST_Point(user_longitude, user_latitude)::geography
        ) / 1000.0
        ELSE 0
      END as calculated_distance,
      
      -- Calculate match score based on specializations
      CASE 
        WHEN c.specializations && search_symptoms THEN 100
        WHEN EXISTS (
          SELECT 1 FROM unnest(c.specializations) spec 
          WHERE spec ILIKE ANY(SELECT '%' || symptom || '%' FROM unnest(search_symptoms) symptom)
        ) THEN 80
        WHEN c.bio_en ILIKE ANY(SELECT '%' || symptom || '%' FROM unnest(search_symptoms) symptom) THEN 60
        ELSE 40
      END as calculated_match_score,
      
      -- Find matched specializations
      ARRAY(
        SELECT spec FROM unnest(c.specializations) spec 
        WHERE spec ILIKE ANY(SELECT '%' || symptom || '%' FROM unnest(search_symptoms) symptom)
      ) as found_specializations
      
    FROM caregivers c
    JOIN users u ON c.user_id = u.id
    WHERE c.is_active = true 
      AND c.is_verified = true
      AND (caregiver_type IS NULL OR c.type = caregiver_type)
      AND (
        -- Match symptoms in specializations
        c.specializations && search_symptoms
        OR EXISTS (
          SELECT 1 FROM unnest(c.specializations) spec 
          WHERE spec ILIKE ANY(SELECT '%' || symptom || '%' FROM unnest(search_symptoms) symptom)
        )
        -- Or match in bio
        OR c.bio_en ILIKE ANY(SELECT '%' || symptom || '%' FROM unnest(search_symptoms) symptom)
        OR c.bio_hi ILIKE ANY(SELECT '%' || symptom || '%' FROM unnest(search_symptoms) symptom)
      )
  )
  SELECT 
    sm.id,
    sm.user_id,
    sm.first_name,
    sm.last_name,
    sm.type,
    sm.specializations,
    sm.qualifications,
    sm.experience_years,
    sm.languages,
    sm.bio_en,
    sm.bio_hi,
    sm.profile_image_url,
    sm.rating,
    sm.total_reviews,
    sm.consultation_fee,
    sm.home_visit_fee,
    sm.available_for_home_visits,
    sm.available_for_online,
    sm.latitude,
    sm.longitude,
    sm.service_radius_km,
    sm.center_id,
    sm.calculated_distance,
    sm.calculated_match_score,
    sm.found_specializations
  FROM symptom_matches sm
  WHERE (max_distance_km IS NULL OR sm.calculated_distance <= max_distance_km OR sm.calculated_distance = 0)
  ORDER BY sm.calculated_match_score DESC, sm.rating DESC, sm.calculated_distance ASC
  LIMIT 20;
END;
$$ LANGUAGE plpgsql;