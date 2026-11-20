import {
  PublisherServiceType,
  ServiceLinkType,
  type PublisherServiceType as PublisherServiceTypeValue,
  type ServiceLinkType as ServiceLinkTypeValue,
} from "@/generated/prisma/enums";

export const serviceTypeOptions: { value: PublisherServiceTypeValue; label: string }[] = [
  { value: PublisherServiceType.GUEST_POST, label: "Guest post" },
  { value: PublisherServiceType.SPONSORED_ARTICLE, label: "Sponsored article" },
  { value: PublisherServiceType.LINK_INSERTION, label: "Link insertion" },
  { value: PublisherServiceType.BANNER_ADVERTISEMENT, label: "Banner advertisement" },
];

export const serviceLinkTypeOptions: { value: ServiceLinkTypeValue; label: string }[] = [
  { value: ServiceLinkType.DOFOLLOW, label: "Do-follow" },
  { value: ServiceLinkType.NOFOLLOW, label: "No-follow" },
  { value: ServiceLinkType.BOTH, label: "Both" },
  { value: ServiceLinkType.NOT_APPLICABLE, label: "Not applicable" },
];

export function formatServiceType(type: PublisherServiceTypeValue): string {
  return serviceTypeOptions.find((option) => option.value === type)?.label ?? type;
}

export function formatServiceLinkType(type: ServiceLinkTypeValue): string {
  return serviceLinkTypeOptions.find((option) => option.value === type)?.label ?? type;
}
