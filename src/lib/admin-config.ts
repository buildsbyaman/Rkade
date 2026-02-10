
export type FieldType = 'text' | 'number' | 'boolean' | 'date' | 'datetime' | 'textarea' | 'json' | 'image' | 'select';

export interface ColumnConfig {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  readonly?: boolean;
  options?: { label: string; value: string }[]; // For select inputs
}

export interface TableConfig {
  name: string;
  label: string;
  columns: ColumnConfig[];
  cardConfig?: {
    titleKey: string;
    subtitleKey?: string;
    imageKey?: string;
    descriptionKey?: string;
  };
}

export const adminConfig: Record<string, TableConfig> = {
  users: {
    name: 'users',
    label: 'Users',
    columns: [
      { key: 'id', label: 'ID', type: 'text', required: true, readonly: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'first_name', label: 'First Name', type: 'text', required: true },
      { key: 'last_name', label: 'Last Name', type: 'text', required: true },
      { key: 'phone_number', label: 'Phone', type: 'text' },
      { key: 'country', label: 'Country', type: 'text' },
      { key: 'profile_picture_url', label: 'Profile Picture', type: 'image' },
      { key: 'created_at', label: 'Created At', type: 'datetime', readonly: true },
    ],
    cardConfig: {
      titleKey: 'email',
      subtitleKey: 'first_name',
      imageKey: 'profile_picture_url'
    }
  },
  events: {
    name: 'events',
    label: 'Events',
    columns: [
      { key: 'event_name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'event_type', label: 'Type', type: 'text' },
      { key: 'subtype_slug', label: 'Subtype', type: 'text' },
      { key: 'date', label: 'Date', type: 'date' },
      { key: 'time', label: 'Time', type: 'text' },
      { key: 'duration', label: 'Duration', type: 'text' },
      { key: 'venue', label: 'Venue', type: 'text' },
      { key: 'price', label: 'Price', type: 'text' },
      { key: 'language', label: 'Language', type: 'text' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'age_limit', label: 'Age Limit', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'performers', label: 'Performers', type: 'text' },
      { key: 'landscape_poster', label: 'Landscape Poster', type: 'image' },
      { key: 'portrait_poster', label: 'Portrait Poster', type: 'image' },
      { key: 'creator_email', label: 'Creator Email', type: 'text' },
      { key: 'created_at', label: 'Created At', type: 'datetime', readonly: true },
    ],
    cardConfig: {
      titleKey: 'event_name',
      subtitleKey: 'slug',
      imageKey: 'landscape_poster',
      descriptionKey: 'description'
    }
  },
  bookings: {
    name: 'bookings',
    label: 'Bookings',
    columns: [
      { key: 'event_id', label: 'Event ID', type: 'text', required: true },
      { key: 'user_id', label: 'User ID', type: 'text' },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'amount_paise', label: 'Amount (Paise)', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Paid', value: 'paid' },
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Cancelled', value: 'cancelled' }
      ]},
    ]
  },
  event_types: {
    name: 'event_types',
    label: 'Event Types',
    columns: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'position', label: 'Position', type: 'number' },
    ]
  },
  categories: {
    name: 'categories',
    label: 'Categories',
    columns: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'position', label: 'Position', type: 'number' },
    ]
  },
  languages: {
    name: 'languages',
    label: 'Languages',
    columns: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'is_active', label: 'Active', type: 'boolean' },
      { key: 'position', label: 'Position', type: 'number' },
    ]
  },
  age_ratings: {
    name: 'age_ratings',
    label: 'Age Ratings',
    columns: [
      { key: 'code', label: 'Code', type: 'text', required: true },
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'min_age', label: 'Min Age', type: 'number' },
    ]
  },
  subtypes: {
    name: 'subtypes',
    label: 'Subtypes',
    columns: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'slug', label: 'Slug', type: 'text', required: true },
      { key: 'event_type_slug', label: 'Event Type Slug', type: 'text' },
      { key: 'location', label: 'Location', type: 'text' },
      { key: 'icon_url', label: 'Icon URL', type: 'image' },
      { key: 'portrait_url', label: 'Portrait URL', type: 'image' },
    ],
    cardConfig: {
        titleKey: 'name',
        subtitleKey: 'location',
        imageKey: 'portrait_url'
    }
  }
};
