import { BEEHIIV_CONFIG, BEEHIIV_FORM_ID } from './beehiiv';

/**
 * REGRESSION TEST FOR PERMANENT BEEHIIV NEWSLETTER INTEGRATION
 * 
 * Verifies that the centralized Beehiiv Form ID configuration remains
 * present and strictly set to 1568b345-dd13-4b23-92cb-19b4cde83232 across builds.
 */

export function verifyBeehiivIntegration(): boolean {
  if (BEEHIIV_FORM_ID !== '1568b345-dd13-4b23-92cb-19b4cde83232') {
    throw new Error(`Regression Error: BEEHIIV_FORM_ID mismatch. Expected 1568b345-dd13-4b23-92cb-19b4cde83232, received ${BEEHIIV_FORM_ID}`);
  }

  if (!BEEHIIV_CONFIG.LOADER_SCRIPT_URL.includes('subscribe-forms.beehiiv.com')) {
    throw new Error('Regression Error: BEEHIIV_CONFIG.LOADER_SCRIPT_URL is invalid.');
  }

  return true;
}

// Self-executing verification check on module import
verifyBeehiivIntegration();
