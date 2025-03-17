import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface MediaUploadProps {
  type: 'image' | 'video' | 'audio';
  maxFiles: number;
  maxSize: number;
  onFilesChange: (files: File[]) => void;
  currentFiles: File[];
  existingFiles?: string[];
  onRemoveExisting?: (url: string) => void;
  disabled?: boolean;
  freeTier?: boolean;
}

const MediaUpload = ({
  type,
  maxFiles,
  maxSize,
  onFilesChange,
  currentFiles,
  existingFiles = [],
  onRemoveExisting,
  disabled = false,
  freeTier = true,
}: MediaUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fileTypes = {
    image: { accept: 'image/*', text: 'imagens' },
    video: { accept: 'video/*', text: 'vídeos' },
    audio: { accept: 'audio/*', text: 'músicas' },
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    for (const file of files) {
      if (!file.type.startsWith(type)) {
        toast({
          title: 'Tipo de arquivo inválido',
          description: `Apenas ${fileTypes[type].text} são permitidos.`,
          variant: 'destructive',
        });
        continue;
      }
      if (file.size > maxSize * 1024 * 1024) {
        toast({
          title: 'Arquivo muito grande',
          description: `O tamanho máximo é ${maxSize}MB.`,
          variant: 'destructive',
        });
        continue;
      }
      validFiles.push(file);
    }
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const totalFiles = currentFiles.length + existingFiles.length;
    if (totalFiles >= maxFiles) {
      toast({
        title: `Limite de ${fileTypes[type].text} atingido`,
        description: freeTier ? `Versão gratuita permite apenas ${maxFiles} ${fileTypes[type].text}.` : `Máximo de ${maxFiles} ${fileTypes[type].text} permitidos.`,
        variant: 'destructive',
      });
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const validFiles = validateFiles(droppedFiles);
      if (validFiles.length === 0) return;

      const availableSlots = maxFiles - totalFiles;
      const filesToAdd = validFiles.slice(0, availableSlots);
      onFilesChange([...currentFiles, ...filesToAdd]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;

    const totalFiles = currentFiles.length + existingFiles.length;
    if (totalFiles >= maxFiles) {
      toast({
        title: `Limite de ${fileTypes[type].text} atingido`,
        description: freeTier ? `Versão gratuita permite apenas ${maxFiles} ${fileTypes[type].text}.` : `Máximo de ${maxFiles} ${fileTypes[type].text} permitidos.`,
        variant: 'destructive',
      });
      return;
    }

    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      const validFiles = validateFiles(selectedFiles);
      if (validFiles.length === 0) return;

      const availableSlots = maxFiles - totalFiles;
      const filesToAdd = validFiles.slice(0, availableSlots);
      onFilesChange([...currentFiles, ...filesToAdd]);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    const newFiles = [...currentFiles];
    newFiles.splice(index, 1);
    onFilesChange(newFiles);
  };

  const renderPreview = () => {
    const allFiles = [
      ...existingFiles.map((url, index) => ({ url, isExisting: true, index })),
      ...currentFiles.map((file, index) => ({ file, isExisting: false, index })),
    ];

    if (allFiles.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {allFiles.map((item) =>
          item.isExisting ? (
            <div key={`existing-${item.index}`} className="relative border rounded-md overflow-hidden p-2">
              {type === 'image' && <img src={item?.url} alt={`Existing ${item.index}`} className="w-full h-full object-cover" />}
              {type === 'video' && <video src={item?.url} controls className="w-full h-full object-cover" />}
           
              {onRemoveExisting && (
                <button onClick={() => onRemoveExisting(item.url)} className="text-red-500 hover:text-red-700 p-1">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div key={`new-${item.index}`} className="relative border rounded-md overflow-hidden p-2">
              {type === 'image' && <img src={URL.createObjectURL(item.file)} alt={`Preview ${item.index}`} className="w-full h-full object-cover" />}
              {type === 'video' && <video src={URL.createObjectURL(item.file)} controls className="w-full h-full object-cover" />}
     
              <button onClick={() => removeFile(item.index)} className="text-red-500 hover:text-red-700 p-1">
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex justify-between items-center">
          <Label htmlFor={`${type}-upload`} className="text-base font-medium">
            {type === 'image' && 'Fotos'}
            {type === 'video' && 'Vídeos'}
          </Label>
          <span className="text-sm text-gray-500">
            {currentFiles.length + existingFiles.length}/{maxFiles} {freeTier}
          </span>
        </div>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'mt-2 border-2 border-dashed rounded-lg p-6 text-center transition-colors',
            isDragging ? 'border-love-400 bg-love-50' : 'border-gray-300 hover:border-love-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <Input
            id={`${type}-upload`}
            type="file"
            ref={fileInputRef}
            accept={fileTypes[type].accept}
            onChange={handleFileInputChange}
            disabled={disabled || currentFiles.length + existingFiles.length >= maxFiles}
            className="hidden"
            multiple={maxFiles > 1}
          />
          <div className="space-y-3">
            <div className="mx-auto w-12 h-12 rounded-full bg-love-50 flex items-center justify-center">
              <Upload className="h-6 w-6 text-love-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium">
                {type === 'image' && 'Adicione suas fotos favoritas'}
                {type === 'video' && 'Adicione vídeos especiais'}
              
              </h3>
              <p className="text-xs text-gray-500">
                Arraste e solte ou
                <label
                  htmlFor={`${type}-upload`}
                  className={cn(
                    'text-love-500 hover:text-love-600 mx-1 cursor-pointer',
                    (disabled || currentFiles.length + existingFiles.length >= maxFiles) && 'opacity-50 pointer-events-none'
                  )}
                >
                  escolha arquivos
                </label>
                (máximo {maxSize}MB cada)
              </p>
            </div>
          </div>
          {freeTier && (
            <div className="mt-4 flex items-start text-xs text-amber-700 bg-amber-50 p-2 rounded">
              <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
              <p className="text-left">
                {type === 'image' && `Versão gratuita: máximo de ${maxFiles} imagens.`}
                {type === 'video' && `Versão gratuita: máximo de ${maxFiles} vídeo de até 30 segundos.`}
              
              </p>
            </div>
          )}
        </div>
      </div>
      {renderPreview()}
    </div>
  );
};

export default MediaUpload;
