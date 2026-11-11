declare module "m3u8-parser" {
  export interface Manifest {
    endList?: boolean;
    targetDuration?: number;
    playlists?: { uri: string; attributes: { BANDWIDTH?: number; AUDIO?: string } }[];
    mediaGroups?: { AUDIO?: Record<string, Record<string, { uri?: string }>> };
    segments: { uri: string; duration: number; discontinuity?: boolean; byterange?: unknown; key?: { method: string }; map?: { uri: string; byterange?: unknown } }[];
  }
  export class Parser { manifest: Manifest; push(input: string): void; end(): void; }
}
