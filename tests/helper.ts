// QA-Sentinel live test: a non-spec helper inside tests/ (expected: R1).
export const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
