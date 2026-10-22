# Frontend

## Run locally

```sh
npm install
npm run dev
```

The app starts in demo mode and uses the sample catalogue and offers. To switch to the backend, copy `.env.example` to `.env.local`, set `VITE_API_MODE=api`, and restart Vite. During development, `/api` is proxied to `http://localhost:3000`. Set `VITE_API_BASE_URL` only when the API lives at another origin. Frontend variables are public; never put secret keys in a `VITE_` variable.

## API contract expected by the frontend

All request and response bodies use JSON. The API should return an `error` string on failures. Login cookies are sent with requests (`credentials: include`), so cross-origin deployments must allow credentials and the exact frontend origin.

| Method and path | Request | Successful response |
| --- | --- | --- |
| `GET /api/products` | none | `{ "products": Product[] }` |
| `GET /api/products/:id/offers` | none | `{ "offers": Offer[] }` |
| `POST /api/auth/login` | `{ "email", "password" }` | `{ "message", "user" }` and secure session cookie |
| `POST /api/auth/register` | `{ "name", "email", "password" }` | `{ "message", "user" }` and secure session cookie |
| `POST /api/auth/logout` | none | `{ "message" }`, clear session cookie |
| `POST /api/orders` | `{ "customer": { "name", "email", "phone", "address" }, "items": [{ "productId", "offerId", "quantity" }] }` | `{ "orderId", "message" }` |
| `POST /api/chat` | `{ "question" }` | `{ "answer" }` |

`Product` fields used in the UI: `id`, `brand`, `model`, `size`, `loadIndex`, `speedIndex`, `season`, `seasonLabel`, `price`, `image`, `fuel`, `wet`, `noise`, `available`, `popularity`, `studded`, and `markings`.

`Offer` fields used in the UI: `id`, `merchantId`, `merchant`, `price`, `availability`, `available`, and `shipping`. `shipping` has `type` (`fixed`, `free-from-quantity`, or `unknown`), `amount`, and optional `quantity`.

The order endpoint must look up product and offer prices itself and calculate totals on the server. It must not trust a price or total sent by a browser. The chat endpoint must limit answers to tire-related questions and reject unrelated topics.
