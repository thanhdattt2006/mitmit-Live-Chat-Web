import React, { useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import useStore from '../store/useStore';
import { Loader2 } from 'lucide-react';
import { translations } from '../utils/translation';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, loginWithToken } = useStore();
  const t = translations[lang];

  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      alert(t.LOGIN_FAILED + error);
      navigate('/', { replace: true });
    } else {
      navigate(location.pathname, { replace: true });
      loginWithToken();
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, loginWithToken, location.pathname, t]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <Loader2 className="animate-spin w-12 h-12 mb-4 text-blue-500" />
      <p className="font-medium text-lg animate-pulse">{t.AUTHENTICATING}</p>
    </div>
  );
}
