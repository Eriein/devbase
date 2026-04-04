-- AlterTable
ALTER TABLE "User" ADD COLUMN     "editorPreferences" JSONB;

-- RenameIndex
ALTER INDEX "VerificationToken_identifier_token_key" RENAME TO "VerificationToken_identifier_hashedToken_key";

-- RenameIndex
ALTER INDEX "VerificationToken_token_key" RENAME TO "VerificationToken_hashedToken_key";
