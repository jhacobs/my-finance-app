import { Upload } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/renderer/components/ui/card";
import { Input } from "@/renderer/components/ui/input";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Spinner } from "@/renderer/components/ui/spinner";
import { getFiles } from "@/renderer/helpers/dropzone";
import { clsx } from "clsx";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/renderer/api/query-keys";

export default function ImportCSV() {
  const queryClient = useQueryClient();

  const { mutate: importCsv, isPending } = useMutation({
    mutationFn: async (file: File) => {
      const filePath = window.electronAPI.getPathOfFile(file);

      return await window.electronAPI.importCsv(filePath);
    },
    onSuccess: async (result) => {
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      const { insertedCount, skippedCount } = result;
      const transactions = insertedCount === 1 ? "transaction" : "transactions";
      const duplicates = skippedCount === 1 ? "duplicate" : "duplicates";

      if (insertedCount === 0) {
        const message = skippedCount
          ? `No new transactions. Skipped ${skippedCount} ${duplicates}.`
          : "No transactions found in CSV.";

        toast.info(message);
        return;
      }

      const skippedMessage = skippedCount
        ? `; skipped ${skippedCount} ${duplicates}`
        : "";

      toast.success(
        `Imported ${insertedCount} ${transactions}${skippedMessage}.`,
      );

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.transactions.index,
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.balance.index }),
        queryClient.invalidateQueries({ queryKey: queryKeys.insights.index }),
      ]);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      if (!file) {
        return;
      }

      importCsv(file);
    },
    [importCsv],
  );

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
          {isPending && (
            <div className="p-8 flex flex-col items-center gap-4">
              <Spinner />

              <span className="text-muted-foreground">
                Importing CSV, please wait...
              </span>
            </div>
          )}

          {!isPending && (
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
