// Little inline-SVG sweets for the shop. Shape comes from the category, colour
// from the name (so each sweet looks the same every time, and distinct from the
// next). Pure presentation.
const palette = [
  '#C0324B', '#E39B33', '#6E9152', '#D96E8A', '#8FBFA3',
  '#B8863B', '#7C6BAF', '#4FA5B8', '#D2542E', '#9CB24A',
];
const ink = '#16110F';

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
function colours(name) {
  const h = hash(name);
  const c1 = palette[h % palette.length];
  const c2 = palette[(h >> 3) % palette.length];
  return [c1, c2 === c1 ? palette[(h >> 5) % palette.length] : c2];
}

function shape(category, c1, c2) {
  switch (category) {
    case 'Liquorice':
      return `<rect x="40" y="20" width="40" height="11" fill="${c1}" stroke="${ink}" stroke-width="2.5"/>
              <rect x="40" y="31" width="40" height="11" fill="${ink}"/>
              <rect x="40" y="42" width="40" height="11" fill="${c2}" stroke="${ink}" stroke-width="2.5"/>
              <rect x="40" y="53" width="40" height="11" fill="${ink}"/>
              <rect x="40" y="20" width="40" height="44" fill="none" stroke="${ink}" stroke-width="2.5"/>`;
    case 'Sour':
      return `<circle cx="60" cy="42" r="27" fill="${c1}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="49" cy="33" r="1.7" fill="#fff" opacity=".8"/>
              <circle cx="66" cy="30" r="1.4" fill="#fff" opacity=".7"/>
              <circle cx="72" cy="45" r="1.6" fill="#fff" opacity=".75"/>
              <circle cx="55" cy="52" r="1.5" fill="#fff" opacity=".7"/>
              <circle cx="45" cy="47" r="1.3" fill="#fff" opacity=".65"/>
              <circle cx="62" cy="40" r="1.4" fill="#fff" opacity=".6"/>
              <path d="M50 24 q10 -6 20 0" fill="none" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/>`;
    case 'Fudge':
      return `<rect x="33" y="24" width="54" height="40" rx="7" fill="${c1}" stroke="${ink}" stroke-width="2.5"/>
              <rect x="33" y="24" width="54" height="13" rx="7" fill="#fff" opacity=".22"/>`;
    case 'Novelty':
      return `<ellipse cx="60" cy="44" rx="35" ry="13" fill="${c1}" stroke="${ink}" stroke-width="2.5"/>
              <ellipse cx="60" cy="38" rx="17" ry="9" fill="${c2}" stroke="${ink}" stroke-width="2.5"/>
              <ellipse cx="54" cy="35" rx="4" ry="2.5" fill="#fff" opacity=".6"/>`;
    case 'Chewy':
      return `<rect x="37" y="22" width="46" height="42" rx="17" fill="${c1}" stroke="${ink}" stroke-width="2.5"/>
              <circle cx="52" cy="36" r="3.5" fill="#fff" opacity=".55"/>
              <circle cx="70" cy="50" r="2.5" fill="#fff" opacity=".4"/>`;
    default: // Boiled: wrapped round sweet
      return `<path d="M12 42 L30 30 L30 54 Z" fill="${c2}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <path d="M108 42 L90 30 L90 54 Z" fill="${c2}" stroke="${ink}" stroke-width="2.5" stroke-linejoin="round"/>
              <circle cx="60" cy="42" r="27" fill="${c1}" stroke="${ink}" stroke-width="2.5"/>
              <ellipse cx="51" cy="33" rx="8" ry="5" fill="#fff" opacity=".5"/>`;
  }
}

export function sweetArt(name, category) {
  const [c1, c2] = colours(name);
  return `<svg viewBox="0 0 120 84" role="img" aria-label="${category} sweet">${shape(category, c1, c2)}</svg>`;
}
