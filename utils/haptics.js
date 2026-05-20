import * as Haptics from 'expo-haptics';

function fire(feedback) {
  feedback().catch(() => {});
}

export const haptic = {
  light:   () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium:  () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  heavy:   () => fire(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error:   () => fire(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
  select:  () => fire(() => Haptics.selectionAsync()),
};
