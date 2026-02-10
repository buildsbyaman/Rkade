declare namespace google.maps {
  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class Geocoder {
    geocode(request: GeocoderRequest): Promise<GeocoderResponse>;
  }

  interface GeocoderRequest {
    address?: string;
    location?: LatLng;
  }

  interface GeocoderResponse {
    results: GeocoderResult[];
    status: string;
  }

  interface GeocoderResult {
    formatted_address: string;
    geometry: {
      location: LatLng;
    };
  }

  namespace places {
    class Autocomplete {
      constructor(input: HTMLInputElement, options?: AutocompleteOptions);
      addListener(event: string, handler: () => void): void;
      getPlace(): PlaceResult;
    }

    interface AutocompleteOptions {
      types?: string[];
      fields?: string[];
    }

    interface PlaceResult {
      formatted_address?: string;
      geometry?: {
        location: LatLng;
      };
    }
  }
}

declare global {
  interface Window {
    google?: typeof google;
  }
}

export {};