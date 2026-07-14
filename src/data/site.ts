export type Service = {
  slug: string;
  name: string;
  category: string;
  price: string;
  duration?: string;
  description: string;
  featured?: boolean;
};

export const categories = ["Brows & Lashes", "Facials", "Laser", "Makeup", "Massage", "Reiki", "Waxing"];

export const services: Service[] = [
  { slug: "brow-shaping", name: "Brow Shaping", category: "Brows & Lashes", price: "$35", duration: "30 min", description: "A thoughtful first-time shaping and the beginning of your best brow routine.", featured: true },
  { slug: "brow-maintenance", name: "Brow Maintenance", category: "Brows & Lashes", price: "$25", description: "A precise refresh for returning brow clients." },
  { slug: "brow-enhancement", name: "Brow Enhancement", category: "Brows & Lashes", price: "$30", description: "Natural-looking color and definition tailored to you." },
  { slug: "maintenance-enhancement", name: "Maintenance with Enhancement", category: "Brows & Lashes", price: "$55", description: "Brow maintenance and tinting in one appointment." },
  { slug: "tweeze-only-brow", name: "Tweeze Only Brow", category: "Brows & Lashes", price: "$40", description: "A full tweeze for guests with sensitive skin." },
  { slug: "keratin-lash", name: "Keratin Lash Enhancement", category: "Brows & Lashes", price: "$100", description: "Lift, nourish, and define your natural lashes." },
  { slug: "custom-facial-60", name: "Custom Facial", category: "Facials", price: "$100", duration: "60 min", description: "A restorative facial tailored to your skin, goals, and season.", featured: true },
  { slug: "custom-facial-30", name: "Express Custom Facial", category: "Facials", price: "$80", duration: "30 min", description: "A focused treatment for beautiful skin on a tighter schedule." },
  { slug: "acne-facial", name: "Acne Facial", category: "Facials", price: "$95", description: "Custom products and techniques for acne-prone skin." },
  { slug: "back-facial", name: "Back Facial", category: "Facials", price: "$95", description: "A complete clarifying and calming treatment for the back." },
  { slug: "dermaplaning-facial", name: "Dermaplaning Facial", category: "Facials", price: "$125", description: "Gentle resurfacing for a brighter, smoother complexion." },
  { slug: "gentle-chemical-peel", name: "Gentle Chemical Peel", category: "Facials", price: "$90", description: "Targeted exfoliation to support texture, tone, and cell turnover." },
  { slug: "kids-facial", name: "Kids Facial", category: "Facials", price: "$50", description: "A gentle custom facial for guests 13 and under. Guardian required." },
  { slug: "body-glow", name: "Body Glow", category: "Facials", price: "$85", description: "Dry exfoliation followed by a soothing moisturizing treatment." },
  { slug: "laser-consultation", name: "Laser Consultation", category: "Laser", price: "Complimentary", description: "A personal plan for safe, effective laser hair removal.", featured: true },
  { slug: "laser-xs", name: "Laser Hair Removal — XS", category: "Laser", price: "From $75", description: "For the nose, ears, upper lip, sideburns, nipples, toes, or chin." },
  { slug: "laser-small", name: "Laser Hair Removal — Small", category: "Laser", price: "From $100", description: "For underarms, bikini line, hands, feet, breast area, or sacrum." },
  { slug: "laser-medium", name: "Laser Hair Removal — Medium", category: "Laser", price: "From $200", description: "For abdomen, face, beard, arms, deluxe bikini, and similar areas." },
  { slug: "laser-large", name: "Laser Hair Removal — Large", category: "Laser", price: "From $250", description: "For Brazilian, chest, back, shoulders, or full arms." },
  { slug: "laser-xl", name: "Laser Hair Removal — XL", category: "Laser", price: "From $300", description: "For chest and abdomen, full back, or full legs." },
  { slug: "full-face-makeup", name: "Full Face Makeup", category: "Makeup", price: "From $100", description: "A polished full-face look, with or without lashes.", featured: true },
  { slug: "basic-makeup", name: "Basic Makeup", category: "Makeup", price: "$75", description: "Fresh, flattering makeup without lashes." },
  { slug: "swedish-massage", name: "Swedish Massage", category: "Massage", price: "From $80", duration: "60–120 min", description: "Long, gliding strokes to support deep relaxation and circulation.", featured: true },
  { slug: "deep-tissue", name: "Deep Tissue Massage", category: "Massage", price: "From $80", duration: "60–120 min", description: "Slow, firm pressure focused on deeper layers of tension." },
  { slug: "targeted-massage", name: "Targeted / Medical Massage", category: "Massage", price: "$65", description: "Outcome-based bodywork focused on specific areas of concern." },
  { slug: "prenatal-massage", name: "Prenatal Massage", category: "Massage", price: "$80", duration: "60 min", description: "Supportive, restorative care designed for pregnancy." },
  { slug: "sports-massage", name: "Sports Massage", category: "Massage", price: "From $50", duration: "30+ min", description: "Focused work for active bodies, mobility, and recovery." },
  { slug: "reflexology", name: "Reflexology", category: "Massage", price: "$65", duration: "45 min", description: "Pressure-point bodywork designed to settle and restore." },
  { slug: "reiki-60", name: "Reiki", category: "Reiki", price: "$70", duration: "60 min", description: "A calming energy session with sound, guided intention, and quiet rest.", featured: true },
  { slug: "reiki-30", name: "Express Reiki", category: "Reiki", price: "$45", duration: "30 min", description: "A shorter reset for grounding and release." },
  { slug: "sound-healing", name: "Sound Healing", category: "Reiki", price: "From $50", description: "A restorative session centered on resonance and deep relaxation." },
  { slug: "guided-meditation", name: "Guided Meditation", category: "Reiki", price: "$30", duration: "30 min", description: "A supported pause for clarity, calm, and reconnection." },
  { slug: "brazilian-wax", name: "Brazilian Wax", category: "Waxing", price: "$65", duration: "20–30 min", description: "Comfortable, efficient full-service waxing with expert care.", featured: true },
  { slug: "brozilian", name: "Brozilian", category: "Waxing", price: "$75", duration: "25 min", description: "Men’s Brazilian waxing in a welcoming, judgment-free setting." },
  { slug: "bikini-wax", name: "Bikini Wax", category: "Waxing", price: "From $45", duration: "15–30 min", description: "Choose a basic or hard-wax service based on your needs." },
  { slug: "full-leg-wax", name: "Full Leg Wax", category: "Waxing", price: "$85", duration: "45 min", description: "Smooth results from thigh to ankle." },
  { slug: "half-leg-wax", name: "Half Leg Wax", category: "Waxing", price: "$60", duration: "30 min", description: "A polished finish for the upper or lower leg." },
  { slug: "back-wax", name: "Back Wax", category: "Waxing", price: "$55", duration: "25 min", description: "Clean, comfortable hair removal for the back." },
  { slug: "chest-wax", name: "Chest Wax", category: "Waxing", price: "$55", duration: "25 min", description: "Professional chest waxing with thoughtful aftercare." },
  { slug: "underarm-wax", name: "Underarm Wax", category: "Waxing", price: "$30", duration: "10 min", description: "A quick appointment with smooth, lasting results." },
  { slug: "mens-brow-wax", name: "Men’s Brow Wax", category: "Waxing", price: "$25", duration: "25 min", description: "Natural cleanup and shape without an overdone finish." },
  { slug: "honeymoon-package", name: "Honeymoon Wax Package", category: "Waxing", price: "From $140", duration: "60 min", description: "A bundled underarm, Brazilian, and leg service." },
];

export type TeamMember = { slug: string; name: string; role: string; specialties: string[]; image: string; bio: string; fullBio?: string[]; externalBooking?: string; archived?: boolean };

export const team: TeamMember[] = [
  { slug: "julie", name: "Julie Campanella Krembel", role: "Founder · Licensed Waxer", specialties: ["Waxing", "Brows", "Laser"], image: "https://tupelohoneyspa.com/wp-content/uploads/2023/09/julie-300.jpg", bio: "Tupelo Honey’s founder and a meticulous specialist known for warm, straightforward care and beautiful results." },
  { slug: "holli", name: "Holli Simme", role: "Licensed Massage Therapist", specialties: ["Massage", "Bodywork"], image: "https://tupelohoneyspa.com/wp-content/uploads/2023/09/holli-300.jpg", bio: "Thoughtful, therapeutic massage that meets your body where it is today.", externalBooking: "https://book-a-massage-today.square.site/" },
  { slug: "janell", name: "Janell Dixon", role: "Licensed Esthetician · RN", specialties: ["Brows", "Lashes", "Waxing"], image: "https://tupelohoneyspa.com/wp-content/uploads/2023/09/janell-300.jpg", bio: "An esthetician, makeup artist, and registered nurse bringing precision and artistry to every appointment." },
  { slug: "jillian", name: "Jillian Blaszkowiak", role: "Licensed Massage Therapist", specialties: ["Massage", "Relaxation"], image: "https://tupelohoneyspa.com/wp-content/uploads/2023/09/jillian-300.jpg", bio: "Restorative massage in a calm, supportive environment." },
  { slug: "danni", name: "Danielle “Danni” Domanowski", role: "Reiki Practitioner", specialties: ["Reiki", "Sound Healing"], image: "https://tupelohoneyspa.com/wp-content/uploads/2023/09/danni-300.jpg", bio: "Grounding energy work designed to help you slow down, reconnect, and leave lighter." },
  { slug: "abby", name: "Abby Brown", role: "Licensed Esthetician", specialties: ["Facials", "Skin"], image: "https://tupelohoneyspa.com/wp-content/uploads/2023/09/abby-300.jpg", bio: "Customized skincare with an approachable, caring touch." },
  { slug: "alex", name: "Alexandria Brown", role: "Licensed Esthetician", specialties: ["Facials", "Skin"], image: "https://tupelohoneyspa.com/wp-content/uploads/2025/01/IMG_3443.jpeg", bio: "Results-minded facials grounded in comfort, education, and care.", archived: true },
  { slug: "heather", name: "Heather Roycroft", role: "Licensed Esthetician", specialties: ["Facials", "Skin"], image: "https://tupelohoneyspa.com/wp-content/uploads/2025/03/heather-roycroft.jpeg", bio: "Personalized skin treatments that make good skincare feel simple." },
];

export const activeTeam = team.filter((member) => !member.archived);

export const categoryIntro: Record<string, string> = {
  "Brows & Lashes": "Subtle definition, expert shaping, and enhancements that still look like you.",
  Facials: "Personalized skin treatments created around your needs—not a one-size-fits-all routine.",
  Laser: "Long-term smoothness supported by expert guidance and a personalized treatment plan.",
  Makeup: "Comfortable, polished looks for everyday confidence and meaningful occasions.",
  Massage: "Restorative bodywork for relaxation, recovery, and everything in between.",
  Reiki: "Quiet, grounding experiences designed to help you reset and reconnect.",
  Waxing: "Inclusive, judgment-free waxing for every body, delivered with confidence and care.",
};
