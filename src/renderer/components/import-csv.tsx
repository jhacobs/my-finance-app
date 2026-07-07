import { Upload } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/renderer/components/ui/card";
import { Input } from "@/renderer/components/ui/input";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Spinner } from "@/renderer/components/ui/spinner";
import { getFiles } from "@/renderer/helpers/dropzone";
import { clsx } from "clsx";

export default function ImportCSV() {
  const [isLoading, setIsLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setIsLoading(true);
    const filePath = window.electronAPI.getPathOfFile(acceptedFiles[0]);
    const result = await window.electronAPI.importCsv(filePath);

    if (result.success) {
      toast.success("CSV imported successfully!");
    }

    if (!result.success && result.error) {
      toast.error(result.error);
    }

    setIsLoading(false);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
    getFilesFromEvent: getFiles,
  });

  return (
    <Card className="min-h-full">
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Upload className="text-primary" />
            Import Transaction data
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <>
          {isLoading && (
            <div className="p-8 flex flex-col items-center gap-4">
              <Spinner />

              <span className="text-muted-foreground">
                Importing CSV, please wait...
              </span>
            </div>
          )}

          {!isLoading && (
            <div
              {...getRootProps()}
              className={clsx(
                "p-8",
                "border-2",
                "border-dashed",
                "border-border",
                "rounded-xl",
                "flex",
                "flex-col",
                "items-center",
                "gap-4",
                "transition",
                "bg-muted/20",
                isDragActive
                  ? "border-primary bg-primary/10"
                  : "hover:border-primary/50",
              )}
            >
              <div
                className={clsx(
                  "bg-muted",
                  "p-4",
                  "rounded-full",
                  "transition",
                  isDragActive && "bg-primary text-primary-foreground",
                )}
              >
                <Upload />
              </div>
              <span className="font-semibold">
                {isDragActive ? "Drop you CSV file here" : "Upload CSV File"}
              </span>
              <span className="text-muted-foreground">
                Drag and drop your transaction CSV file
              </span>
              <Input {...getInputProps()} type="file" accept=".csv"></Input>
            </div>
          )}
        </>
      </CardContent>
    </Card>
  );
}
