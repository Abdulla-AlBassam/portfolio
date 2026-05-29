import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";

// Reads the checked-in content files at build time. Works the same under both
// local and GitHub storage, since the content lives in the repo either way.
export const reader = createReader(process.cwd(), keystaticConfig);
