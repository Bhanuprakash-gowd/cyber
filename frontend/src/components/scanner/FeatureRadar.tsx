import React from 'react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

interface FeatureRadarProps {
  features?: Record<string, any>;
}

export const FeatureRadar: React.FC<FeatureRadarProps> = ({ features = {} }) => {
  // Normalize metrics onto a 0-100 scale for comparison radar
  const data = [
    {
      subject: 'Entropy',
      value: Math.min(100, Math.round(((features.entropy || 0) / 5.5) * 100)),
      fullMark: 100,
    },
    {
      subject: 'Length Risk',
      value: Math.min(100, Math.round(((features.url_length || features.message_length || 20) / 80) * 100)),
      fullMark: 100,
    },
    {
      subject: 'Subdomains',
      value: Math.min(100, (features.subdomains || 0) * 33),
      fullMark: 100,
    },
    {
      subject: 'Lure Keywords',
      value: Math.min(100, (features.keyword_count || features.indicators_count || 0) * 25),
      fullMark: 100,
    },
    {
      subject: 'Special Chars',
      value: Math.min(100, (features.special_chars || 0) * 15),
      fullMark: 100,
    },
    {
      subject: 'Protocol Security',
      value: features.has_https === false ? 90 : 15,
      fullMark: 100,
    }
  ];

  return (
    <div className="w-full h-64 flex flex-col items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#1e293b" tick={false} />
          <Radar
            name="Anomaly Vector"
            dataKey="value"
            stroke="#06b6d4"
            fill="#06b6d4"
            fillOpacity={0.35}
          />
        </RadarChart>
      </ResponsiveContainer>
      <span className="text-[10px] font-mono text-slate-500 mt-1">Feature Extraction Anomaly Vector</span>
    </div>
  );
};
