import toast from 'react-hot-toast';
import axiosClient from '../../../api/axiosClient';
import useStore from '../../../store/useStore';

export default function useOptimisticUpload(friend, replyingTo, setReplyingTo, stompClientRef) {
  const uploadMedia = async (file, type) => {
    // 1. NGAY LẬP TỨC TẠO LOCAL URL VÀ GẮN LÊN UI
    const localUrl = URL.createObjectURL(file);
    const tempId = 'temp_' + Date.now();
    const replyTarget = replyingTo ? { ...replyingTo } : null;
    
    const tempMsg = {
      id: tempId,
      isUploading: true,
      type: type,
      [type === 'IMAGE' ? 'imageUrl' : 'audioUrl']: localUrl,
      isMine: true,
      replyTo: replyTarget
    };
    
    useStore.getState().addTemporaryMessage(tempMsg);
    setReplyingTo(null);

    // 2. GỌI API UPLOAD
    try {
      const formData = new FormData();
      formData.append('file', file, type === 'VOICE' ? 'audio.webm' : file.name);
      
      const response = await axiosClient.post('/api/v1/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const fileUrl = response?.data || response;
      
      const payload = {
        friendshipId: friend.friendshipId,
        content: fileUrl,
        type: type,
        replyToId: tempMsg.replyTo?.id || null,
        senderId: useStore.getState().userInfo?.id,
        isUnsent: false
      };
      
      if (stompClientRef.current?.connected) {
        stompClientRef.current.publish({ destination: '/app/chat.private', body: JSON.stringify(payload) });
      }
      
      useStore.getState().removeTemporaryMessage(tempId);
    } catch (error) {
      console.error(`Lỗi gửi ${type}:`, error);
      toast.error(`Gửi ${type === 'VOICE' ? 'âm thanh' : 'ảnh'} thất bại`);
      useStore.getState().removeTemporaryMessage(tempId);
    } finally {
      URL.revokeObjectURL(localUrl);
    }
  };

  return { uploadMedia };
}
