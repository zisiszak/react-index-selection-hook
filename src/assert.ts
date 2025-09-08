export function ASSERT(assertion: boolean, failureMessage?: string) {
	if (!assertion) throw new Error(failureMessage);
}
