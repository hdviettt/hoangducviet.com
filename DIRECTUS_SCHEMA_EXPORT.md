# Directus Schema Export for Blog Application

This document contains all the data models and collection schemas used by the Next.js blog application. Use this to recreate your Directus backend structure.

## Environment Variables Required

```env
NEXT_PUBLIC_DIRECTUS_API_ENDPOINT="<Your Directus URL>"
```

## Collections Overview

The application uses the following Directus collections:
1. **global** - Site-wide metadata
2. **home** - Homepage content  
3. **hdviet** - Profile/portfolio content (main page)
4. **posts** - Blog posts
5. **post_categories** - Post categorization
6. **pages** - Dynamic pages
7. **projects** - Project showcase

---

## 1. Global Collection (Singleton)

**Collection Name:** `global`  
**Type:** Singleton  
**Description:** Site-wide metadata and configuration

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | integer | Yes | Primary key |
| title | string | No | Site title |
| tagline | string | No | Site tagline/subtitle |

---

## 2. Home Collection (Singleton)

**Collection Name:** `home`  
**Type:** Singleton  
**Description:** Homepage content configuration

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | integer | Yes | Primary key |
| hero_title | string | No | Hero section title |
| hero_subtitle | string | No | Hero section subtitle |
| hero_cover | file (M2O) | No | Hero background image |
| hero_buttons | json | No | Array of button objects |
| featured_title | string | No | Featured section title |
| featured_posts | M2M | No | Related to posts collection |

### Hero Buttons Structure:
```json
[
  {
    "label": "Button Text",
    "link": "/url-path"
  }
]
```

### Relations:
- `hero_cover` → directus_files (Many-to-One)
- `featured_posts` → posts (Many-to-Many)

---

## 3. Hdviet Collection

**Collection Name:** `hdviet`  
**Type:** Regular Collection  
**Description:** Profile/portfolio entries displayed on homepage

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | integer | Yes | Primary key |
| name | string | No | Profile name |
| description | WYSIWYG/HTML | No | HTML formatted description |
| image | file (M2O) | No | Profile image |

### Relations:
- `image` → directus_files (Many-to-One)

---

## 4. Posts Collection

**Collection Name:** `posts`  
**Type:** Regular Collection  
**Description:** Blog posts

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| id | integer | Yes | Primary key |
| slug | string | Yes | URL slug (unique) |
| title | string | No | Post title |
| description | text | No | Short description/excerpt |
| body | WYSIWYG/HTML | No | Post content (HTML) |
| thumbnail | file (M2O) | No | Featured image |
| date_created | datetime | Yes | Creation timestamp |
| categories | M2M | No | Related categories |

### Relations:
- `thumbnail` → directus_files (Many-to-One)
- `categories` → post_categories (Many-to-Many through junction table)

### Junction Table Configuration:
The M2M relationship with categories requires:
- Junction collection with foreign keys to both posts and post_categories
- The junction should expose `post_categories_slug` field

---

## 5. Post Categories Collection

**Collection Name:** `post_categories`  
**Type:** Regular Collection  
**Description:** Categories for blog posts

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| slug | string | Yes | Primary key - Category slug |
| title | string | No | Category display name |

**Note:** This collection uses `slug` as the primary key instead of `id`

---

## 6. Pages Collection

**Collection Name:** `pages`  
**Type:** Regular Collection  
**Description:** Dynamic pages with block editor content

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| slug | string | Yes | Primary key - URL slug |
| title | string | No | Page title |
| navigation | string | No | Navigation placement |
| body | json | No | Block editor content |
| date_created | datetime | Yes | Creation timestamp |

### Body Field Structure (Block Editor):
```json
{
  "time": 1234567890,
  "version": "2.x.x",
  "blocks": [
    {
      "id": "unique-id",
      "type": "paragraph|header|image|list",
      "data": {
        "text": "Content text",
        "level": 1-6,
        "file": {
          "url": "image-url",
          "width": 800,
          "height": 600
        },
        "caption": "Image caption",
        "withBorder": false,
        "withBackground": false,
        "stretched": false
      }
    }
  ]
}
```

**Note:** This collection uses `slug` as the primary key instead of `id`

---

## 7. Projects Collection

**Collection Name:** `projects`  
**Type:** Regular Collection  
**Description:** Project showcase entries

### Fields:
| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| slug | string | Yes | Primary key - URL slug |
| title | string | No | Project title |
| description | text | No | Project description |
| thumbnail | file (M2O) | No | Project thumbnail image |
| posts | M2M | No | Related blog posts |
| date_created | datetime | No | Creation timestamp |
| date_updated | datetime | No | Last update timestamp |

### Relations:
- `thumbnail` → directus_files (Many-to-One)
- `posts` → posts (Many-to-Many)

**Note:** This collection uses `slug` as the primary key instead of `id`

---

## Directus Files Configuration

All image fields reference the `directus_files` collection with these expected fields:
- `filename_disk` - The actual filename on disk
- `height` - Image height in pixels  
- `width` - Image width in pixels

---

## Setup Instructions

1. **Create Collections:**
   - Create each collection with the specified names
   - For singleton collections (global, home), configure them as single item collections
   - For pages, post_categories, and projects - set `slug` as the primary key field

2. **Configure Fields:**
   - Add all fields with their specified types
   - For WYSIWYG fields, use the HTML editor interface
   - For JSON fields (body in pages, hero_buttons in home), use the JSON interface

3. **Setup Relations:**
   - Configure all M2O relations to directus_files for image fields
   - Setup M2M relations with appropriate junction tables
   - Ensure junction tables expose necessary fields (like post_categories_slug)

4. **Permissions:**
   - Configure public read access for all collections
   - Set appropriate permissions for content editors

5. **Initial Data:**
   - Create at least one entry in singleton collections (global, home)
   - Add sample content to test the integration

---

## Important Notes

1. **Primary Keys:** The collections `pages`, `post_categories`, and `projects` use `slug` as the primary key instead of the default `id` field.

2. **Image Handling:** All image fields should be configured to return the file object with `filename_disk`, `height`, and `width` properties.

3. **Block Editor:** The pages collection uses a JSON field for block editor content. Ensure the JSON structure matches the expected format.

4. **Categories Junction:** The M2M relationship between posts and categories must expose the `post_categories_slug` field in the junction table for proper frontend functionality.

5. **HTML Content:** The `body` field in posts and `description` field in hdviet store HTML content, so configure them with appropriate WYSIWYG editors in Directus.

---

## Testing the Setup

After creating all collections and fields:

1. Add test data to each collection
2. Update the `.env.local` file with your Directus endpoint
3. Run the Next.js application and verify all pages load correctly:
   - Homepage (hdviet data)
   - /posts (blog posts with categories)
   - /projects (project listings)
   - Dynamic pages by slug

If any errors occur, check:
- Field names match exactly (case-sensitive)
- Relations are properly configured
- Required fields have data
- Permissions allow public read access