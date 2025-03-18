// src/components/MiniPreview.tsx
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Camera, Video, Music } from 'lucide-react';

interface MiniPreviewProps {
  formData: {
    coupleName: string;
    relationshipStartDate: Date | null;
    message: string;
    spotifyLink: string;
  };
  media: {
    photos: (File | string)[];
    videos: (File | string)[];
    musics: (File | string)[];
    spotifyLink: string;
  };
}

const MiniPreview = ({ formData, media }: MiniPreviewProps) => {
  const { coupleName, relationshipStartDate, message, spotifyLink } = formData;
  const { photos, videos } = media;

  // Obter a primeira foto para exibir (se houver)
  const firstPhoto = photos.length > 0 
    ? typeof photos[0] === 'string' 
      ? photos[0] 
      : URL.createObjectURL(photos[0])
    : 'https://via.placeholder.com/300x200?text=Sem+Foto';

  return (
    <div className="bg-gray-50 border rounded-lg p-4 shadow-sm w-full max-w-[300px] mx-auto">
      <h3 className="text-lg font-semibold text-center text-gray-800 mb-2">
        {coupleName || 'Seu Card Digital'}
      </h3>

      <img
        src={firstPhoto}
        alt="Foto do casal"
        className="w-full h-32 object-cover rounded-md mb-2"
      />

      <p className="text-sm text-gray-600 italic mb-2">
        {message || 'Escreva uma mensagem especial...'}
      </p>

      <p className="text-xs text-gray-500 mb-2">
        {relationshipStartDate
          ? `Início: ${format(new Date(relationshipStartDate), 'dd/MM/yyyy', { locale: ptBR })}`
          : 'Data de início não definida'}
      </p>

      <div className="flex justify-center gap-2 text-gray-500 text-xs">
        {photos.length > 0 && (
          <div className="flex items-center gap-1">
            <Camera className="h-4 w-4" />
            <span>{photos.length} {photos.length === 1 ? 'foto' : 'fotos'}</span>
          </div>
        )}
        {videos.length > 0 && (
          <div className="flex items-center gap-1">
            <Video className="h-4 w-4" />
            <span>{videos.length} {videos.length === 1 ? 'vídeo' : 'vídeos'}</span>
          </div>
        )}
        {(media.musics.length > 0 || (spotifyLink && spotifyLink.includes('spotify.com'))) && (
          <div className="flex items-center gap-1">
            <Music className="h-4 w-4" />
            <span>Música adicionada</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MiniPreview;
