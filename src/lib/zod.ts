import { config, z } from "zod";

// Zod decides whether to JIT-compile when each z.object() is created, by
// probing `new Function("")`. Under our CSP (no 'unsafe-eval') that probe is
// reported as a violation on every page, even though Zod falls back fine.
// Configuring here, in the module every schema imports z from, guarantees it
// runs before the first schema exists. Import z from "@/lib/zod", not "zod".
config({ jitless: true });

export { z };
