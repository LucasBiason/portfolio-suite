# Image Upload and Download System

## Endpoints

### 1. Upload Image
**POST** `/api/assets/upload?tag={tag}`

**Authentication:** Required (Bearer Token)

**Body:** `multipart/form-data` with `file` field

**Query Parameters:**
- `tag` (required): Image tag (e.g., `avatar`, `hero-background`, `project-image`)

**Example:**
```bash
curl -X POST \
  http://localhost:3001/api/assets/upload?tag=avatar \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/image.jpg"
```

**Response:**
```json
{
  "success": true,
  "url": "http://localhost:3001/uploads/user-999999999/avatar-1234567890.jpg",
  "tag": "avatar",
  "message": "Image uploaded successfully."
}
```

**Behavior:**
- If an image with the same tag already exists, it will be replaced
- Images are stored in `public/uploads/user-{userId}/`
- Filename format: `{tag}-{timestamp}.{ext}`

### 2. Download/Get Image URL
**GET** `/api/assets/:tag`

**Authentication:** Required (Bearer Token)

**Example:**
```bash
curl -X GET \
  http://localhost:3001/api/assets/avatar \
  -H "Authorization: Bearer {token}"
```

**Response:**
```json
{
  "url": "http://localhost:3001/uploads/user-999999999/avatar-1234567890.jpg",
  "tag": "avatar"
}
```

**404 Error:** If image doesn't exist for the specified tag

### 3. List All Images
**GET** `/api/assets`

**Authentication:** Required (Bearer Token)

**Response:**
```json
{
  "images": [
    {
      "tag": "avatar",
      "filename": "1234567890.jpg",
      "url": "http://localhost:3001/uploads/user-999999999/avatar-1234567890.jpg"
    },
    {
      "tag": "hero-background",
      "filename": "1234567891.png",
      "url": "http://localhost:3001/uploads/user-999999999/hero-background-1234567891.png"
    }
  ]
}
```

### 4. Delete Image
**DELETE** `/api/assets/:tag`

**Authentication:** Required (Bearer Token)

**Example:**
```bash
curl -X DELETE \
  http://localhost:3001/api/assets/avatar \
  -H "Authorization: Bearer {token}"
```

**Response:** 204 No Content

## Common Tags

- `avatar` - User profile picture
- `hero-background` - Hero section background image
- `project-{projectId}` - Image for a specific project

## Folder Structure

```
public/
  uploads/
    user-{userId}/
      avatar-{timestamp}.jpg
      hero-background-{timestamp}.png
      project-123-{timestamp}.jpg
  temp/
    {temporary-files} (cleaned after upload)
```

## Validations

- **Allowed types:** JPEG, JPG, PNG, GIF, WEBP, SVG
- **Max size:** 5MB
- **Authentication:** All routes require valid JWT token
- **Isolation:** Each user can only access their own images
