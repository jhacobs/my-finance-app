import { Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { useCallback } from "react";
import clsx from "clsx";
import { useDropzone } from "react-dropzone";

export default function ImportCSV() {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log(acceptedFiles);
    // Do something with the files
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="flex items-center gap-2">
            <Upload />
            Import Transaction data
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={clsx(
            "p-8",
            "border-2",
            "border-dashed",
            "border-gray-300",
            "rounded-md",
            "flex",
            "flex-col",
            "items-center",
            "gap-4",
            "transition",
            isDragActive ? "border-primary" : "border-gray-300",
          )}
        >
          <div
            className={clsx(
              "bg-muted",
              "p-4",
              "rounded-full",
              "transition",
              isDragActive && "bg-primary",
            )}
          >
            <Upload color={isDragActive ? "white" : undefined} />
          </div>
          <span className="font-semibold">
            {isDragActive ? "Drop you CSV file here" : "Upload CSV File"}
          </span>
          <span className="text-muted-foreground">
            Drag and drop your transaction CSV file
          </span>
          <Input {...getInputProps()} type="file" accept=".csv"></Input>
        </div>
      </CardContent>
    </Card>
  );
}
