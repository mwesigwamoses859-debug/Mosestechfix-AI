# Manual Mobile Money setup for MosesTech Fix AI

The application uses manual MTN/Airtel Money verification and device-bound activation codes. It does not use Pesapal and it never asks a customer for a Mobile Money PIN.

## Required hosting secrets

- `GEMINI_API_KEY`: Gemini API key used by the AI endpoints.
- `APP_URL`: Public HTTPS address of this application.
- `ACCESS_TOKEN_SECRET`: A private random value containing at least 32 characters.
- `ADMIN_ACTIVATION_SECRET`: A private administrator password containing at least 12 characters.

Store these values only in the hosting provider's protected environment-variable settings. Do not commit them to GitHub or add them to browser code.

## Customer workflow

1. A new browser receives a three-day free trial.
2. The customer chooses a weekly, monthly, Remote Tech Pass or Business IT Care plan.
3. The customer sends the displayed amount to the MosesTech MTN or Airtel Money number.
4. The customer enters their name, phone number and transaction reference, then selects **Send Payment Details on WhatsApp**.
5. The prepared message includes the plan, amount, transaction reference and unique device code.
6. MosesTech checks the transaction on the receiving Mobile Money account.
7. MosesTech generates a device activation code and sends it privately to the verified customer.
8. The customer pastes the code into the subscription screen.

## Administrator workflow

1. Open the deployed application with `?admin=activation` at the end of its URL.
2. Open the subscription screen.
3. Enter `ADMIN_ACTIVATION_SECRET`, the verified transaction details, selected plan and customer device code.
4. Generate the code and send it only to the verified customer's WhatsApp number.

The administrator endpoint checks the protected password on the server. Generated codes are cryptographically signed with `ACCESS_TOKEN_SECRET`, tied to one device code and expire at the end of the purchased access period.

## Important limitations

- Keep both server secrets private and rotate them if they are exposed.
- Confirm the payment amount and transaction reference on the receiving phone before generating any code.
- Clearing browser storage changes the device code and removes locally stored access, so a customer may need a replacement code after legitimate device/browser recovery.
- For stronger account recovery, multi-device access and audit history, add authenticated user accounts and a persistent database in a later version.
