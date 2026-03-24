export const META_EVENT_NAMES = [
  "Contact",
  "CompleteRegistration",
  "InitiateCheckout",
  "Lead",
  "Search",
  "ViewContent",
] as const;

export type MetaEventName = (typeof META_EVENT_NAMES)[number];

export type MetaEventPayload = {
  customData?: Record<string, unknown>;
  email?: string;
  eventId?: string;
  eventName: MetaEventName;
  eventSourceUrl?: string;
  fbc?: string;
  fbp?: string;
};

export function isMetaEventName(value: string): value is MetaEventName {
  return META_EVENT_NAMES.includes(value as MetaEventName);
}
