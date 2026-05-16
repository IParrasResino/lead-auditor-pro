#!/usr/bin/env python3
"""
main.py — Search for businesses using Google Places API (New)

Reads environment variables and searches for businesses matching criteria.
Outputs to output/places_results.json and output/leads_base_YYYYMMDD_HHMMSS.xlsx
"""

import os
import sys
import json
import time
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Optional

import requests
import pandas as pd


def get_env(key: str, default: str = "") -> str:
    """Get environment variable with optional default."""
    value = os.getenv(key, default)
    if not value and key in ["GOOGLE_PLACES_API_KEY"]:
        raise ValueError(f"Missing required environment variable: {key}")
    return value


def generate_place_id(name: str, address: str = "", phone: str = "") -> str:
    """Generate stable place_id if not provided."""
    combined = f"{name}|{address}|{phone}"
    hash_obj = hashlib.md5(combined.encode())
    return f"generated_{hash_obj.hexdigest()[:16]}"


def search_places(
    api_key: str,
    query: str,
    max_results: int = 20,
    delay: float = 0.5
) -> List[Dict[str, Any]]:
    """Search for places using Google Places API (New)."""
    url = "https://places.googleapis.com/v1/places:searchText"
    
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": api_key,
        "X-Goog-FieldMask": (
            "places.id,"
            "places.displayName,"
            "places.websiteUri,"
            "places.nationalPhoneNumber,"
            "places.formattedAddress,"
            "places.rating,"
            "places.userRatingCount,"
            "places.businessStatus,"
            "nextPageToken"
        ),
    }
    
    payload = {
        "textQuery": query,
        "maxResultCount": min(max_results, 20),  # API limit
    }
    
    results = []
    page_token = None
    
    while len(results) < max_results:
        if page_token:
            payload["pageToken"] = page_token
        
        try:
            print(f"[main.py] Searching: {query} (results: {len(results)})")
            response = requests.post(url, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            places = data.get("places", [])
            
            if not places:
                break
            
            results.extend(places)
            
            page_token = data.get("nextPageToken")
            if not page_token:
                break
            
            time.sleep(delay)
            
        except requests.exceptions.RequestException as e:
            print(f"[main.py] Error searching: {e}", file=sys.stderr)
            break
    
    return results[:max_results]


def transform_place(place: Dict[str, Any], sector: str, zone: str) -> Optional[Dict[str, Any]]:
    """Transform Google Places result to lead format."""
    try:
        # Check business status
        status = place.get("businessStatus", "OPERATIONAL")
        if status != "OPERATIONAL":
            return None
        
        # Extract fields
        place_id = place.get("id", "")
        name = place.get("displayName", {}).get("text", "")
        website = place.get("websiteUri")
        phone = place.get("nationalPhoneNumber")
        address = place.get("formattedAddress", "")
        rating = place.get("rating", 0)
        review_count = place.get("userRatingCount", 0)
        
        if not place_id or not name:
            return None
        
        return {
            "place_id": place_id,
            "nombre_negocio": name,
            "sector": sector,
            "zona_busqueda": zone,
            "direccion": address,
            "web": website,
            "telefono": phone,
            "rating": rating,
            "reseñas": review_count,
            "estado_negocio": status,
        }
    except Exception as e:
        print(f"[main.py] Error transforming place: {e}", file=sys.stderr)
        return None


def main():
    """Main execution."""
    try:
        # Read environment variables
        api_key = get_env("GOOGLE_PLACES_API_KEY")
        city = get_env("CITY", "Madrid")
        zones_str = get_env("ZONES", "Centro")
        sectors_str = get_env("SECTORS", "restaurantes")
        max_pages = int(get_env("MAX_PAGES", "1"))
        min_rating = float(get_env("MIN_RATING", "4.0"))
        min_reviews = int(get_env("MIN_REVIEWS", "75"))
        only_without_website = get_env("ONLY_WITHOUT_WEBSITE", "false").lower() == "true"
        request_delay = float(get_env("REQUEST_DELAY_SECONDS", "0.5"))
        
        zones = [z.strip() for z in zones_str.split(",") if z.strip()]
        sectors = [s.strip() for s in sectors_str.split(",") if s.strip()]
        
        print(f"[main.py] Starting business search...")
        print(f"[main.py] City: {city}")
        print(f"[main.py] Zones: {', '.join(zones)}")
        print(f"[main.py] Sectors: {', '.join(sectors)}")
        print(f"[main.py] Min rating: {min_rating}, Min reviews: {min_reviews}")
        
        # Create output directory
        os.makedirs("output", exist_ok=True)
        
        all_places = []
        seen_ids = set()
        
        # Search for each sector in each zone
        for sector in sectors:
            for zone in zones:
                query = f"{sector} {zone} {city}"
                max_results = max_pages * 20  # 20 results per page
                
                places = search_places(api_key, query, max_results, request_delay)
                
                for place in places:
                    place_id = place.get("id")
                    
                    # Deduplicate
                    if place_id in seen_ids:
                        continue
                    seen_ids.add(place_id)
                    
                    # Check filters
                    rating = place.get("rating", 0)
                    review_count = place.get("userRatingCount", 0)
                    website = place.get("websiteUri")
                    
                    if rating < min_rating or review_count < min_reviews:
                        continue
                    
                    if only_without_website and website:
                        continue
                    
                    # Transform
                    transformed = transform_place(place, sector, zone)
                    if transformed:
                        all_places.append(transformed)
                
                time.sleep(request_delay)
        
        print(f"[main.py] Found {len(all_places)} businesses after filtering")
        
        # Save results
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # JSON output
        output_json = {
            "timestamp": datetime.now().isoformat(),
            "city": city,
            "zones": zones,
            "sectors": sectors,
            "total_places": len(all_places),
            "places": all_places,
        }
        
        json_file = "output/places_results.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(output_json, f, indent=2, ensure_ascii=False)
        print(f"[main.py] Saved results to {json_file}")
        
        # Excel output
        if all_places:
            df = pd.DataFrame(all_places)
            excel_file = f"output/leads_base_{timestamp}.xlsx"
            df.to_excel(excel_file, index=False, engine="openpyxl")
            print(f"[main.py] Saved Excel to {excel_file}")
        
        print(f"[main.py] Search completed successfully")
        return 0
        
    except Exception as e:
        print(f"[main.py] ERROR: {str(e)}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
