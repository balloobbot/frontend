import type { HomeAssistant } from "../../types";
import { uploadFile } from "../file_upload";
import type { RepositoryBase } from "./repository";

type CallWS = Pick<HomeAssistant, "callWS">;

// Installing an integration over a built-in one answers with this until it is confirmed
export const ERROR_REPLACES_BUILT_IN = "replaces_built_in";

// An integration installed from a ZIP archive the user uploaded
export interface MarketplaceArchive {
  domain: string;
  name: string;
  version: string;
  config_flow: boolean;
  installed_at: string;
  pending_restart: boolean;
}

// A row of the repository table, the archive has no repository behind it
export interface ArchiveRepository extends RepositoryBase {
  source: "zip";
}

export const ARCHIVE_ID_PREFIX = "zip:";

export const fetchMarketplaceArchives = (hass: CallWS) =>
  hass.callWS<MarketplaceArchive[]>({ type: "marketplace/archives/list" });

// The upload is used up by the attempt, also by one that is refused
export const installMarketplaceArchive = async (
  hass: HomeAssistant,
  file: File,
  options: { confirmReplaceBuiltIn?: boolean } = {}
) =>
  hass.callWS<MarketplaceArchive>({
    type: "marketplace/archive/install",
    file_id: await uploadFile(hass, file),
    ...(options.confirmReplaceBuiltIn
      ? { confirm_replace_built_in: true }
      : {}),
  });

export const uninstallMarketplaceArchive = (hass: CallWS, domain: string) =>
  hass.callWS<null>({ type: "marketplace/archive/uninstall", domain });

export const isArchiveRepository = (
  repository: RepositoryBase
): repository is ArchiveRepository =>
  (repository as Partial<ArchiveRepository>).source === "zip";

export const archiveRepository = (
  archive: MarketplaceArchive,
  description: string
): ArchiveRepository => ({
  source: "zip",
  authors: [],
  available_version: archive.version,
  can_install: true,
  category: "integration",
  config_flow: archive.config_flow,
  custom: true,
  description,
  domain: archive.domain,
  downloads: 0,
  file_name: "",
  full_name: archive.domain,
  hide: false,
  homeassistant: null,
  id: `${ARCHIVE_ID_PREFIX}${archive.domain}`,
  installed_version: archive.version,
  installed: true,
  last_updated: archive.installed_at,
  local_path: `custom_components/${archive.domain}`,
  name: archive.name,
  new: false,
  pending_upgrade: false,
  stars: 0,
  status: archive.pending_restart ? "pending-restart" : "installed",
  topics: [],
});
