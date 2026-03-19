-- Rename token to hashedToken in VerificationToken
ALTER TABLE "VerificationToken" RENAME COLUMN "token" TO "hashedToken";
