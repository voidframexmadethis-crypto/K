/**
 * PERMANENT BEEHIIV NEWSLETTER INTEGRATION CONFIGURATION
 * 
 * CRITICAL STORE INTEGRATION NOTE:
 * This Beehiiv Form ID connects the KRAEZELV Free Download email gate directly
 * to Bucky's Newsletter audience (https://buckys-newsletter.beehiiv.com/).
 * 
 * Do NOT remove, rename, or alter this public Form ID during future codebase edits,
 * feature additions, or deployments. It is a permanent core feature of the store's
 * Free Download email capture flow.
 */

export const BEEHIIV_CONFIG = {
  /** Public Beehiiv Subscribe Form ID for Bucky's Newsletter */
  FORM_ID: '1568b345-dd13-4b23-92cb-19b4cde83232' as string,
  
  /** Official Beehiiv Newsletter Publication Domain */
  PUBLICATION_URL: 'https://buckys-newsletter.beehiiv.com' as string,
  
  /** Official Beehiiv Subscribe Form Script Loader */
  LOADER_SCRIPT_URL: 'https://subscribe-forms.beehiiv.com/v3/loader.js' as string,
  
  /** Direct Form Action Endpoint */
  FORM_ACTION_URL: 'https://subscribe-forms.beehiiv.com/v3/forms/1568b345-dd13-4b23-92cb-19b4cde83232/subscribe' as string,
};

export const BEEHIIV_FORM_ID: string = BEEHIIV_CONFIG.FORM_ID;
