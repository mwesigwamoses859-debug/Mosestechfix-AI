# Deploying MosesTech Fix AI

The project can be deployed to Render or Google Cloud Run. Render is the recommended primary service. Cloud Run can be kept as a backup deployment.

## Secrets required on both platforms

- `GEMINI_API_KEY`: Gemini API key used by the AI endpoints.
- `ACCESS_TOKEN_SECRET`: random private value of at least 32 characters.
- `ADMIN_ACTIVATION_SECRET`: private administrator password of at least 12 characters.
- `NODE_ENV`: `production`.

Never add real secret values to GitHub, this ZIP, `render.yaml`, the Dockerfile or `.env.example`.

## Render

The included `render.yaml` defines the web service, build/start commands, health check and protected variables.

1. Put the project in a private GitHub repository.
2. In Render, create a **Blueprint** and connect that repository.
3. Render reads `render.yaml` from the repository root.
4. Enter `GEMINI_API_KEY` and create a strong `ADMIN_ACTIVATION_SECRET` when prompted.
5. Allow the first deployment to complete, then visit `/api/health` on the Render address.
6. Open the main Render address and test the three-day trial and subscription screen.

`ACCESS_TOKEN_SECRET` is generated automatically by the Render Blueprint. Do not regenerate it after customers receive activation codes, because changing it invalidates previously issued codes.

## Google Cloud Run

The included Dockerfile follows Cloud Run's container requirements. The application reads the `PORT` value supplied by Cloud Run and listens on `0.0.0.0`.

1. Create or select a Google Cloud project with billing enabled.
2. Enable Cloud Run, Cloud Build, Artifact Registry and Secret Manager.
3. Store the three private values in Secret Manager.
4. From the project directory, deploy the source:

   ```bash
   gcloud run deploy mosestechfix-ai \
     --source . \
     --region africa-south1 \
     --allow-unauthenticated
   ```

5. In the Cloud Run service, open **Edit and deploy new revision → Containers → Variables and Secrets**.
6. Reference the Secret Manager values using the environment-variable names above and deploy the revision.
7. Visit `/api/health` on the generated Cloud Run address.

Cloud Run supplies `PORT`; do not manually create a `PORT` environment variable.

## Custom website link

After the Render deployment is healthy, add a button on `mosestechfixsolution.com` pointing to the Render service. A custom subdomain such as `ai.mosestechfixsolution.com` can be connected later through Render's custom-domain screen and the corresponding Cloudflare DNS record.

## Administrator access

Append `?admin=activation` to the deployed application URL, open the subscription screen and enter `ADMIN_ACTIVATION_SECRET`. Verify every Mobile Money transaction on the receiving phone before generating a customer code.
