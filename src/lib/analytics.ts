import { FirebaseAnalytics } from '@capacitor-community/firebase-analytics';

export const logToolUsage = async (toolId: string, toolName: string) => {
  await FirebaseAnalytics.logEvent({
    name: 'tool_viewed',
    params: {
      item_id: toolId,
      item_name: toolName,
      content_type: 'tool'
    }
  });
};

export const logScreenView = async (screenName: string) => {
  await FirebaseAnalytics.setScreenName({
    screenName: screenName,
    nameOverride: screenName
  });
};