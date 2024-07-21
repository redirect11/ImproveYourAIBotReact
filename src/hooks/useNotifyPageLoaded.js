import { useEffect } from 'react';

const useNotifyPageLoaded = ({page}) => {
//   useEffect(() => {
// 	const onPageLoad = () => {
// 	  console.log('page loaded');
// 	  // Invia il segnale sul QWebChannel per notificare che la pagina è stata caricata
//         if (window.webViewManager) {
//             window.webViewManager.pageLoadFinished(page);
//         }
// 	};

// 	if (document.readyState === 'complete') {
// 	  onPageLoad();
// 	} else {
// 	  window.addEventListener('load', onPageLoad, false); //TODO method to be exposed qt side
// 	  return () => window.removeEventListener('load', onPageLoad);
// 	}
//   }, []);
};

export default useNotifyPageLoaded;