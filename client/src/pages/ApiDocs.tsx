import React, { useState } from 'react';
import { Code2, Copy, Check, Terminal } from 'lucide-react';

export const ApiDocs: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyCode = (code: string, idx: number) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const snippets = [
    {
      title: 'Fetch Random Banner Ad (JavaScript)',
      lang: 'javascript',
      code: `fetch('http://localhost:5000/api/ads/banner', {
  headers: {
    'x-api-key': 'pa_live_prince_cinema_98f24a12'
  }
})
  .then(res => res.json())
  .then(data => console.log('Banner Ad:', data.data));`,
    },
    {
      title: 'Fetch Video Pre-Roll Ad (JavaScript)',
      lang: 'javascript',
      code: `fetch('http://localhost:5000/api/ads/video')
  .then(res => res.json())
  .then(data => {
    const videoUrl = data.data.mediaUrl;
    console.log('Video Stream URL:', videoUrl);
  });`,
    },
    {
      title: 'React Custom Hook Integration Example',
      lang: 'tsx',
      code: `import { useState, useEffect } from 'react';

export function usePrinceAds(placement = 'banner') {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetch(\`http://localhost:5000/api/ads/placement/\${placement}\`)
      .then(r => r.json())
      .then(d => d.success && setAd(d.data));
  }, [placement]);

  return ad;
}`,
    },
    {
      title: 'cURL Command (Terminal)',
      lang: 'bash',
      code: `curl -X GET "http://localhost:5000/api/ads/banner" \\
  -H "x-api-key: pa_live_prince_cinema_98f24a12"`,
    },
  ];

  return (
    <div className="space-y-6 select-none">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2">
          <Code2 className="h-5 w-5 text-cyan-400" />
          <span>API Integration Documentation</span>
        </h2>
        <p className="text-xs text-neutral-400">
          Complete REST API reference for embedding Prince Ads into Prince Studios Cinema or external web apps.
        </p>
      </div>

      {/* Endpoints Table */}
      <div className="p-5 rounded-3xl bg-neutral-900/80 border border-white/10 space-y-3">
        <h3 className="text-sm font-bold text-white">Public API Endpoints</h3>
        <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden font-mono text-xs">
          <table className="w-full text-left">
            <thead className="bg-white/5 text-neutral-400 text-[10px]">
              <tr>
                <th className="p-3">HTTP Method</th>
                <th className="p-3">Endpoint Path</th>
                <th className="p-3">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-cyan-300">/api/ads</td>
                <td className="p-3 text-neutral-400 font-sans">List all active campaigns</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-cyan-300">/api/ads/banner</td>
                <td className="p-3 text-neutral-400 font-sans">Get weighted priority banner ad</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-cyan-300">/api/ads/video</td>
                <td className="p-3 text-neutral-400 font-sans">Get weighted priority video ad</td>
              </tr>
              <tr>
                <td className="p-3 text-emerald-400 font-bold">GET</td>
                <td className="p-3 text-cyan-300">/api/ads/placement/:placement</td>
                <td className="p-3 text-neutral-400 font-sans">Get ad for placement (preshow, intermission, popup, banner)</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-400 font-bold">POST</td>
                <td className="p-3 text-cyan-300">/api/ads/impression/:id</td>
                <td className="p-3 text-neutral-400 font-sans">Record impression counter</td>
              </tr>
              <tr>
                <td className="p-3 text-blue-400 font-bold">POST</td>
                <td className="p-3 text-cyan-300">/api/ads/click/:id</td>
                <td className="p-3 text-neutral-400 font-sans">Record click counter</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Snippets */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-white">Integration Code Examples</h3>

        {snippets.map((snip, idx) => (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-neutral-950 border border-cyan-500/30 space-y-2 overflow-hidden"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="font-bold text-xs text-white flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                {snip.title}
              </span>
              <button
                onClick={() => copyCode(snip.code, idx)}
                className="flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedIndex === idx ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    <span>Copy Snippet</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 rounded-xl bg-neutral-900 border border-white/10 text-cyan-300 text-xs font-mono overflow-x-auto">
              {snip.code}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
