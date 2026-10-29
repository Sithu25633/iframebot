import { execFile } from "child_process";
import path from "path";

export interface ResolvedStreamResult {
  success: boolean;
  title: string;
  year?: number;
  poster: string;
  backdrop?: string;
  quality: string;
  size_text?: string;
  direct_url?: string;
  stream_url?: string;
  error?: string;
  is_telegram?: boolean;
}

export async function resolveStreamLink(
  mediaUrl: string,
  quality: string = "720p"
): Promise<ResolvedStreamResult> {
  return new Promise((resolve, reject) => {
    const resolverScript = path.join(process.cwd(), "resolver", "resolver.py");
    const args = [mediaUrl, "--quality", quality];

    const pythonCmd = process.platform === "win32" ? "python" : "python3";

    execFile(
      pythonCmd,
      [resolverScript, ...args],
      { maxBuffer: 15 * 1024 * 1024, timeout: 60000 },
      (err, stdout, stderr) => {
        if (err) {
          console.error("[StreamResolver] Execution error:", err.message, stderr);
          return resolve({
            success: false,
            title: "Unknown",
            poster: "",
            quality,
            error: err.message || "Failed to resolve stream link",
          });
        }

        try {
          // Find JSON in output
          const jsonMatch = stdout.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("No JSON found in resolver output");
          }
          const data = JSON.parse(jsonMatch[0]);
          if (!data.success && !data.direct_url) {
            return resolve({
              success: false,
              title: data.title || "Unknown",
              poster: data.poster || "",
              quality,
              error: data.error || "Could not find streamable video URL",
            });
          }

          resolve({
            success: true,
            title: data.title || "Movie Stream",
            year: data.year,
            poster: data.poster || "",
            backdrop: data.backdrop || "",
            quality: data.quality || quality,
            size_text: data.size_text || "",
            direct_url: data.direct_url,
            stream_url: data.direct_url,
          });
        } catch (parseErr: any) {
          console.error("[StreamResolver] JSON parse error:", parseErr, stdout);
          resolve({
            success: false,
            title: "Unknown",
            poster: "",
            quality,
            error: "Failed to parse resolver response",
          });
        }
      }
    );
  });
}
