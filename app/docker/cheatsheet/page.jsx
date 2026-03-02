import { readFile } from "fs/promises";
import { join } from "path";
import { CheatSheet } from "@/components/docker/CheatSheet";

export default async function CheatSheetPage() {
   const content = await readFile(
      join(process.cwd(), "markdown", "docker-cheatsheet.md"),
      "utf-8",
   );

   return (
      <div className="my-6">
         <CheatSheet content={content} />
      </div>
   );
}
