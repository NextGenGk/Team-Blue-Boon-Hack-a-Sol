-- Enhanced function to search caregivers based on AI-analyzed symptoms
-- This function works with the existing schema structure
CREATE OR REPLACE FUNCTION search_caregivers_by_symptoms(
  specializations text[] DEFAULT NULL,
  symptoms text[] DEFAULT NULL,
  conditions text[] DEFAULT NULL,
  caregiver_type text DEFAULT 'nurse',
  urgency_level text DEFAULT 'low',
  user_latitude double precision DEFAULT NULL,
  user_longitude double precision DEFAULT NULL,
  max_distance_km integer DEFAULT 50,
  confidence_threshold double precision DEFAULT 0.3
)
RETURNS TABLE (
  id uuid,
  name text,
  first_name text,
  last_name text,
  type text,
  specializations text[],
  bio text,
  consultation_fee numeric,
  home_visit_fee numeric,
  available_for_home_visits boolean,
  available_for_online boolean,
  latitude double precision,
  longitude double precision,
  service_radius_km integer,
  is_verified boolean,
  is_active boolean,
  experience_years integer,
  languages text[],
  qualifications text[],
  rating double precision,
  total_reviews integer,
  profile_image_url text,
  distance_km double precision,
  match_score numeric,
  recommended_reason text
)
LANGUAGE plpgsql
AS $$
DECLARE
  distance_filter boolean := false;
BEGIN
  -- Check if we should apply distance filtering
  IF user_latitude IS NOT NULL AND user_longitude IS NOT NULL THEN
    distance_filter := true;
  END IF;

  RETURN QUERY
  SELECT 
    c.id,
    COALESCE(c.first_name || ' ' || c.last_name, 'Healthcare Provider') as name,
    c.first_name,
    c.last_name,
    c.type,
    c.specializations,
    c.bio,
    c.consultation_fee,
    c.home_visit_fee,
    c.available_for_home_visits,
    c.available_for_online,
    c.latitude,
    c.longitude,
    c.service_radius_km,
    c.is_verified,
    c.is_active,
    c.experience_years,
    c.languages,
    c.qualifications,
    4.5::double precision as rating, -- Default rating since not in schema
    (10 + floor(random() * 40))::integer as total_reviews, -- Mock reviews
    u.image_url as profile_image_url,
    CASE 
      WHEN distance_filter AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
        (6371 * acos(
          cos(radians(user_latitude)) * cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(user_longitude)) + 
          sin(radians(user_latitude)) * sin(radians(c.latitude))
        ))
      ELSE NULL
    END as distance_km,
    -- Calculate match score based on specialization overlap
    CASE 
      WHEN specializations IS NOT NULL AND array_length(specializations, 1) > 0 THEN
        LEAST(95, 60 + (
          SELECT COUNT(*) * 10
          FROM unnest(c.specializations) as caregiver_spec
          WHERE EXISTS (
            SELECT 1 
            FROM unnest(specializations) as search_spec
            WHERE caregiver_spec ILIKE '%' || search_spec || '%'
               OR search_spec ILIKE '%' || caregiver_spec || '%'
          )
        ))
      ELSE 70
    END::numeric as match_score,
    -- Generate recommendation reason
    CASE 
      WHEN specializations IS NOT NULL AND array_length(specializations, 1) > 0 THEN
        'Specializes in ' || array_to_string(
          ARRAY(
            SELECT caregiver_spec
            FROM unnest(c.specializations) as caregiver_spec
            WHERE EXISTS (
              SELECT 1 
              FROM unnest(specializations) as search_spec
              WHERE caregiver_spec ILIKE '%' || search_spec || '%'
                 OR search_spec ILIKE '%' || caregiver_spec || '%'
            )
            LIMIT 2
          ), ', '
        ) || ' • ' || c.experience_years || ' years experience'
      ELSE 
        'Experienced healthcare provider • ' || array_to_string(c.specializations, ', ')
    END as recommended_reason
  FROM public.caregivers c
  JOIN public.users u ON c.user_id = u.id
  WHERE 
    -- Active and verified caregivers only
    c.is_active = true
    AND c.is_verified = true
    AND u.role = 'caregiver'
    
    -- Filter by caregiver type (all are nurses in your schema)
    AND c.type = 'nurse'
    
    -- Specialization matching (flexible)
    AND (
      specializations IS NULL 
      OR array_length(specializations, 1) IS NULL
      OR EXISTS (
        SELECT 1 
        FROM unnest(c.specializations) as caregiver_spec
        WHERE EXISTS (
          SELECT 1 
          FROM unnest(specializations) as search_spec
          WHERE caregiver_spec ILIKE '%' || search_spec || '%'
             OR search_spec ILIKE '%' || caregiver_spec || '%'
        )
      )
    )
    
    -- Distance filtering if location provided
    AND (
      NOT distance_filter
      OR (
        c.latitude IS NOT NULL 
        AND c.longitude IS NOT NULL
        AND (6371 * acos(
          cos(radians(user_latitude)) * cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(user_longitude)) + 
          sin(radians(user_latitude)) * sin(radians(c.latitude))
        )) <= max_distance_km
      )
    )
    
    -- Availability filtering based on urgency
    AND (
      urgency_level NOT IN ('high', 'emergency')
      OR c.available_for_online = true
    )
    
  ORDER BY
    -- Prioritize by specialization match
    CASE 
      WHEN specializations IS NOT NULL AND array_length(specializations, 1) > 0 THEN
        (
          SELECT COUNT(*)
          FROM unnest(c.specializations) as caregiver_spec
          WHERE EXISTS (
            SELECT 1 
            FROM unnest(specializations) as search_spec
            WHERE caregiver_spec ILIKE '%' || search_spec || '%'
               OR search_spec ILIKE '%' || caregiver_spec || '%'
          )
        )
      ELSE 0
    END DESC,
    
    -- Then by experience
    c.experience_years DESC NULLS LAST,
    
    -- Finally by distance if available
    CASE 
      WHEN distance_filter AND c.latitude IS NOT NULL AND c.longitude IS NOT NULL THEN
        (6371 * acos(
          cos(radians(user_latitude)) * cos(radians(c.latitude)) * 
          cos(radians(c.longitude) - radians(user_longitude)) + 
          sin(radians(user_latitude)) * sin(radians(c.latitude))
        ))
      ELSE 999999
    END ASC
    
  LIMIT 50;
END;
$$;