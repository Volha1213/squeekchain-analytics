export function HamsterWheel({ running }: { running: boolean }) {
  return (
    <svg
      viewBox="0 0 340 240"
      role="img"
      aria-labelledby="wheel-title"
      className={running ? "hamster-art running" : "hamster-art"}
    >
      <title id="wheel-title">
        Illustration of Squeektoshi in a hamster wheel
      </title>
      <defs>
        <linearGradient id="wheel-fade" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#b8c995" />
          <stop offset="1" stopColor="#535f46" />
        </linearGradient>
        <linearGradient id="fur" x1="0" y1="0" x2=".8" y2="1">
          <stop stopColor="#e6b888" />
          <stop offset="1" stopColor="#bd825b" />
        </linearGradient>
        <radialGradient id="wheel-glow">
          <stop stopColor="#b9d77b" stopOpacity=".12" />
          <stop offset="1" stopColor="#b9d77b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse
        cx="174"
        cy="215"
        rx="104"
        ry="8"
        fill="currentColor"
        opacity=".06"
      />
      <circle cx="174" cy="114" r="110" fill="url(#wheel-glow)" />
      <path
        d="M155 150 131 212h88l-24-62"
        fill="none"
        stroke="#66745a"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <path
        d="M124 213h103"
        stroke="#899974"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <g className="wheel-spokes">
        <circle
          cx="174"
          cy="111"
          r="87"
          fill="none"
          stroke="#4b5741"
          strokeWidth="10"
        />
        <circle
          cx="174"
          cy="111"
          r="87"
          fill="none"
          stroke="url(#wheel-fade)"
          strokeWidth="4"
        />
        {Array.from({ length: 24 }, (_, i) => (
          <path
            key={i}
            d="M174 25v9"
            transform={`rotate(${i * 15} 174 111)`}
            stroke="#9baa86"
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
        <path
          d="M174 29v164M92 111h164M116 53l116 116M116 169 232 53"
          stroke="#6b795c"
          strokeWidth="1.5"
          opacity=".45"
        />
        <circle
          cx="174"
          cy="111"
          r="9"
          fill="#657652"
          stroke="#a4b885"
          strokeWidth="3"
        />
      </g>
      <g className="hamster-body">
        <ellipse
          cx="168"
          cy="162"
          rx="44"
          ry="28"
          fill="url(#fur)"
          transform="rotate(-13 168 162)"
        />
        <ellipse cx="177" cy="164" rx="29" ry="23" fill="#f5dfbc" />
        <path d="M134 148c-10-12-9-24-1-26 7-2 13 8 15 19" fill="#ce986d" />
        <path d="M204 145c12-7 18-2 16 5-1 6-9 9-16 10" fill="#edc99e" />
        <ellipse cx="192" cy="147" rx="25" ry="23" fill="#e3b58a" />
        <ellipse
          cx="184"
          cy="127"
          rx="10"
          ry="12"
          fill="#cf966e"
          transform="rotate(-22 184 127)"
        />
        <ellipse
          cx="184"
          cy="127"
          rx="5"
          ry="7"
          fill="#eab2a0"
          transform="rotate(-22 184 127)"
        />
        <path d="M190 159c6 8 19 8 24-1-5-5-15-5-24 1" fill="#f7e7d1" />
        <circle cx="202" cy="144" r="3.5" fill="#282a23" />
        <circle cx="203" cy="143" r="1" fill="white" />
        <ellipse cx="215" cy="153" rx="3.3" ry="2.4" fill="#9c6a62" />
        <path
          d="m215 160 16 2m-17-6 17-3"
          stroke="#b78f72"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <ellipse cx="145" cy="186" rx="12" ry="5" fill="#e7bc94" />
        <ellipse cx="191" cy="183" rx="11" ry="4.5" fill="#edc99e" />
        <path
          d="M140 185h9m38-3h8"
          stroke="#bd8968"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M63 81h13m-6-6v12M267 47h10m-5-5v10"
        stroke="#adc88a"
        strokeWidth="1.4"
        opacity=".6"
      />
      <circle cx="262" cy="172" r="3" fill="#bfd78e" opacity=".55" />
    </svg>
  );
}
