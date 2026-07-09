export const useFileUpload = () => {
  const api = useApi();
  const uploading = ref(false);
  const progress = ref(0);
  const error = ref<string | null>(null);

  const uploadFiles = async (url: string, files: File[], fieldName = 'files') => {
    uploading.value = true;
    error.value = null;
    progress.value = 0;

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append(fieldName, file));
      const res = await api.upload<any>(url, formData);
      progress.value = 100;
      return res;
    } catch (err: any) {
      error.value = err?.data?.error?.message || 'Upload failed';
      throw err;
    } finally {
      uploading.value = false;
    }
  };

  const validateFile = (file: File, options?: { maxSizeMB?: number; allowedTypes?: string[] }) => {
    const maxSize = (options?.maxSizeMB || 5) * 1024 * 1024;
    if (file.size > maxSize) {
      return `File size exceeds ${options?.maxSizeMB || 5}MB limit`;
    }
    if (options?.allowedTypes && !options.allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not allowed`;
    }
    return null;
  };

  return { uploadFiles, validateFile, uploading, progress, error };
};
