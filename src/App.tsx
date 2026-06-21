import React, { useRef, useState, useEffect } from "react";
import { 
  Upload, 
  Download, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  FileCode, 
  Terminal, 
  Award, 
  Info, 
  Copy, 
  Check, 
  Image as ImageIcon, 
  Maximize2, 
  Undo,
  BookOpen,
  MousePointer,
  Sparkle
} from "lucide-react";

// Preset colors for background removal
const PRESET_REMOVE_COLORS = [
  { name: 'Hijau Screen', hex: '#00ff00', r: 0, g: 255, b: 0, label: '🟢 Green-screen studio' },
  { name: 'Biru Tua Wisuda', hex: '#1d4ed8', r: 29, g: 79, b: 216, label: '🔵 Biru studio' },
  { name: 'Merah Latar', hex: '#dc2626', r: 220, g: 38, b: 38, label: '🔴 Merah studio' },
  { name: 'Putih Studio', hex: '#ffffff', r: 255, g: 255, b: 255, label: '⚪ Putih studio' }
];

export default function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<'editor' | 'python'>('editor');
  const [copiedAppPy, setCopiedAppPy] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);

  // Core Image State
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [studentImage, setStudentImage] = useState<HTMLImageElement | null>(null);
  const [studentImageName, setStudentImageName] = useState<string>("wisuda");
  const [customBgImage, setCustomBgImage] = useState<HTMLImageElement | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Background Template Settings
  const [selectedTemplate, setSelectedTemplate] = useState<'blue' | 'red' | 'library' | 'gray' | 'custom'>('blue');
  
  // Chroma Key Settings
  const [keyColor, setKeyColor] = useState<{ r: number, g: number, b: number }>({ r: 0, g: 255, b: 0 }); // Default Green
  const [tolerance, setTolerance] = useState<number>(45);
  const [feather, setFeather] = useState<number>(15);
  const [spillReduction, setSpillReduction] = useState<number>(30);
  const [eyedropperActive, setEyedropperActive] = useState<boolean>(false);

  // Subject Transforming Settings
  const [scale, setScale] = useState<number>(75);
  const [offsetX, setOffsetX] = useState<number>(0);
  const [offsetY, setOffsetY] = useState<number>(0);
  const [rotation, setRotation] = useState<number>(0);

  // Branding Elements Settings
  const [studentName, setStudentName] = useState<string>("");
  const [studentClass, setStudentClass] = useState<string>("9-A");
  const [showGoldBorder, setShowGoldBorder] = useState<boolean>(true);
  const [showWatermark, setShowWatermark] = useState<boolean>(true);

  // Mouse Dragging Interaction State on Main Canvas
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number }>({ x: 0, y: 0 });

  // Refs for Canvases
  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const rawPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // App.py and requirements.txt local text caching
  const appPyCode = `import streamlit as st
import os
from PIL import Image, ImageDraw, ImageOps
import numpy as np

st.set_page_config(
    page_title="pitulikurmedia | Otomasi Foto Wisuda",
    page_icon="🎓",
    layout="centered"
)

st.markdown("<h1 style='text-align: center; color: #1e3a8a;'>🎓 Portal Foto Wisuda pitulikurmedia</h1>", unsafe_allow_html=True)
st.markdown("<h3 style='text-align: center; color: #b45309;'>SMP IP Almuhibbin</h3>", unsafe_allow_html=True)

# Membuka file template asli dari disk lokal
template_path = "template.jpg"
template_img = None

try:
    if os.path.exists(template_path):
        template_img = Image.open(template_path)
    else:
        st.warning("⚠️ Template resmi 'template.jpg' tidak ditemukan di direktori lokal.")
except Exception as e:
    st.error(f"Gagal memuat template: {str(e)}")

# File uploader untuk melampirkan foto siswa
uploaded_file = st.file_uploader("Unggah Foto Mentah Wisuda Anda di Sini", type=["png", "jpg", "jpeg"])

if uploaded_file is not None and template_img is not None:
    original_fullname = uploaded_file.name
    filename_without_ext = os.path.splitext(original_fullname)[0]
    
    st.info("⏳ Mengekstrak subjek... Silakan tunggu sebentar.")
    try:
        # Load foto siswa dan perbaiki orientasi otomatis EXIF (dari jepretan kamera ponsel agar tidak miring)
        student_raw = ImageOps.exif_transpose(Image.open(uploaded_file))
        
        # Menggunakan remove background 'rembg' murni tanpa sentuhan AI Generatif
        from rembg import remove
        student_np = np.array(student_raw)
        output_np = remove(student_np) # hasil transparan RGBA
        student_extracted = Image.fromarray(output_np)
        
        # Compositing dan resizing proporsional otomatis di tengah bawah
        tmpl_w, tmpl_h = template_img.size
        subj_w, subj_h = student_extracted.size
        
        scale_factor = 0.75 # Skala ideal 75%
        ratio = (tmpl_h / subj_h) * scale_factor
        new_w, new_h = int(subj_w * ratio), int(subj_h * ratio)
        student_resized = student_extracted.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        x_pos = (tmpl_w - new_w) // 2
        y_pos = tmpl_h - new_h
        
        # Tempelkan ke template dasar
        composite_result = template_img.copy()
        composite_result.paste(student_resized, (x_pos, y_pos), student_resized)
        final_rgb = composite_result.convert("RGB")
        
        # Tampilkan pratinjau hasil
        st.image(final_rgb, caption="Pratinjau Hasil - pitulikurmedia")
        
        # Download button
        from io import BytesIO
        img_buffer = BytesIO()
        final_rgb.save(img_buffer, format="JPEG", quality=95)
        
        st.download_button(
            label="💾 Unduh Foto Wisuda (High-Res)",
            data=img_buffer.getvalue(),
            file_name=f"Wisuda_pitulikurmedia_{filename_without_ext}.jpg",
            mime="image/jpeg"
        )
    except Exception as e:
        st.error(f"Eror proses: {str(e)}")`;

  const requirementsTxtCode = `streamlit>=1.32.0
rembg>=2.0.53
pillow>=10.2.0
numpy>=1.26.4
onnxruntime>=1.17.1`;

  // Standard Canvas template rendering sub-routines
  const renderTemplateOnContext = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    if (selectedTemplate === 'blue') {
      // 1. ROYAL BLUE GRADIENT
      ctx.fillStyle = '#0b162f';
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(w / 2, h / 2 - 100, 50, w / 2, h / 2 - 100, Math.max(w, h));
      grad.addColorStop(0, '#2563eb'); 
      grad.addColorStop(0.3, '#1d4ed8');
      grad.addColorStop(0.7, '#111e47');
      grad.addColorStop(1, '#080d1a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Soft vignette brush texture
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const seedX = (0.3 + 0.4 * Math.sin(i * 1.7)) * w;
        const seedY = (0.2 + 0.6 * Math.cos(i * 0.9)) * h;
        const radius = 60 + (i % 5) * 30;
        ctx.beginPath();
        ctx.arc(seedX, seedY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (selectedTemplate === 'red') {
      // 2. ROYAL CRIMSON RED GRADIENT
      ctx.fillStyle = '#22030f';
      ctx.fillRect(0, 0, w, h);

      const grad = ctx.createRadialGradient(w / 2, h / 2 - 100, 50, w / 2, h / 2 - 100, Math.max(w, h));
      grad.addColorStop(0, '#dc2626'); 
      grad.addColorStop(0.3, '#991b1b');
      grad.addColorStop(0.7, '#450a0a');
      grad.addColorStop(1, '#1a0105');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Fine vignette texture
      ctx.save();
      ctx.globalAlpha = 0.05;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 40; i++) {
        const seedX = (0.2 + 0.6 * Math.sin(i * 2.3)) * w;
        const seedY = (0.3 + 0.5 * Math.cos(i * 1.1)) * h;
        const radius = 50 + (i % 6) * 25;
        ctx.beginPath();
        ctx.arc(seedX, seedY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (selectedTemplate === 'library') {
      // 3. CINEMATIC BLURRED BOOKSHELF
      ctx.fillStyle = '#291305';
      ctx.fillRect(0, 0, w, h);

      const woodGrad = ctx.createLinearGradient(0, 0, w, h);
      woodGrad.addColorStop(0, '#854d0e'); 
      woodGrad.addColorStop(0.5, '#451a03'); 
      woodGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(0, 0, w, h);

      // Render blurred styled shelf backdrops
      ctx.fillStyle = 'rgba(28, 25, 23, 0.45)';
      const shelfYPositions = [200, 480, 760, 1040, 1300];
      
      shelfYPositions.forEach((sh, idx) => {
        ctx.fillRect(0, sh, w, 22);
        // Draw books side-by-side with varying warm colors
        let cursorX = 40;
        while (cursorX < w - 45) {
          const bW = 18 + ((idx * 3 + cursorX) % 17);
          const bH = 130 + ((cursorX * 7) % 65);
          
          // Library collection palette (Burgundy, Forest Gold, Navy Leather, Dark Stone)
          const bookPalette = ['#7f1d1d', '#022c22', '#14532d', '#1e3a8a', '#172554', '#3f1651', '#451a03', '#1e293b'];
          const colorIndex = (Math.floor(cursorX * 1.3)) % bookPalette.length;
          
          ctx.fillStyle = bookPalette[colorIndex];
          ctx.fillRect(cursorX, sh - bH, bW, bH);
          
          // Golden status stripes on book backbones
          ctx.fillStyle = 'rgba(234, 179, 8, 0.45)';
          ctx.fillRect(cursorX + 2, sh - bH + 18, bW - 4, 7);
          ctx.fillRect(cursorX + 2, sh - bH + 32, bW - 4, 3);
          
          cursorX += bW + 2 + (cursorX % 4);
        }
      });

      // Apply highly artistic warm photo vignetting for cinematic bokeh blur feel
      const radialVignette = ctx.createRadialGradient(w / 2, h / 2, 80, w / 2, h / 2, Math.max(w, h));
      radialVignette.addColorStop(0, 'rgba(115, 61, 7, 0.15)'); // ambient warm core
      radialVignette.addColorStop(0.4, 'rgba(43, 21, 4, 0.55)');
      radialVignette.addColorStop(1, 'rgba(0, 0, 0, 0.88)'); // thick dark corners
      ctx.fillStyle = radialVignette;
      ctx.fillRect(0, 0, w, h);
    } else if (selectedTemplate === 'gray') {
      // 4. TEXTURED CHARCOAL GRAY PORTRAIT BACKDROP
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, w, h);

      // radial gradient
      const grad = ctx.createRadialGradient(w / 2, h / 2, 100, w / 2, h / 2, Math.max(w, h));
      grad.addColorStop(0, '#64748b'); // Soft grey lighting
      grad.addColorStop(0.4, '#334155');
      grad.addColorStop(0.8, '#1e293b');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Fine sponge spray texture
      ctx.save();
      ctx.globalAlpha = 0.08;
      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < 60; i++) {
        const seedX = Math.random() * w;
        const seedY = Math.random() * h;
        const radius = 30 + Math.random() * 80;
        ctx.beginPath();
        ctx.arc(seedX, seedY, radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    } else if (selectedTemplate === 'custom' && customBgImage) {
      // 5. CUSTOM UPLOADED BACKGROUND
      // Scale and draw custom background image to fill the canvas bounds (aspect fill)
      const imgRatio = customBgImage.width / customBgImage.height;
      const canvasRatio = w / h;
      let drawW = w;
      let drawH = h;
      let sx = 0;
      let sy = 0;

      if (imgRatio > canvasRatio) {
        // Image is wider than canvas
        drawW = customBgImage.height * canvasRatio;
        drawH = customBgImage.height;
        sx = (customBgImage.width - drawW) / 2;
      } else {
        // Image is taller than canvas
        drawW = customBgImage.width;
        drawH = customBgImage.width / canvasRatio;
        sy = (customBgImage.height - drawH) / 2;
      }
      ctx.drawImage(customBgImage, sx, sy, drawW, drawH, 0, 0, w, h);
    } else {
      // FALLBACK TO NAVY FLAT
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, w, h);
    }

    // --- GOLD DECORATIVE STUDIOS BORDERS ---
    if (showGoldBorder) {
      ctx.save();
      // Thin outer gold shine border
      ctx.strokeStyle = '#f59e0b'; // Amber Gold
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, w - 20, h - 20);

      // Elegant thick gold inner frame
      ctx.strokeStyle = '#b45309'; // Warm Bronze/Gold
      ctx.lineWidth = 14;
      ctx.strokeRect(22, 22, w - 44, h - 44);

      // Inermost light line inside frame for professional studio finish
      ctx.strokeStyle = '#fbbf24'; // Bright yellow shine
      ctx.lineWidth = 1.5;
      ctx.strokeRect(29, 29, w - 58, h - 58);
      ctx.restore();
    }
  };

  // Generate and set Demo Photograph
  const handleLoadDemoImage = () => {
    setIsProcessing(true);
    // Create student vector illustration and load as image
    const dataUrl = generateDemoStudentImage();
    
    const img = new Image();
    img.src = dataUrl;
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setStudentImage(img);
      setRawImageSrc(dataUrl);
      setStudentImageName("Siswa_Wisuda_Demo");
      // Pre-set standard green key color for keying
      setKeyColor({ r: 0, g: 255, b: 0 }); 
      setTolerance(50);
      setFeather(15);
      
      // Auto-set student name to a proper demo name
      setStudentName("Satria Al-Muhibbin");
      setStudentClass("9-C");
      
      // Reset coordinates to proper center resting
      setOffsetX(0);
      setOffsetY(30);
      setScale(85);
      setRotation(0);
      setIsProcessing(false);
    };
  };

  // Helper code to render the demo student on the fly for first load
  const generateDemoStudentImage = (): string => {
    const canvas = document.createElement('canvas');
    canvas.width = 450;
    canvas.height = 550;
    const ctx = canvas.getContext('2d')!;

    // 1. Fill solid green screen background
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Draw Toga Tessel & Robes (Gown)
    ctx.fillStyle = '#0f172a'; // Dark navy-black robe
    ctx.beginPath();
    ctx.moveTo(60, 550);
    ctx.bezierCurveTo(110, 390, 340, 390, 390, 550);
    ctx.closePath();
    ctx.fill();

    // Draw gold sash/collar (Samir Wisuda)
    ctx.fillStyle = '#eab308'; // Gold sash
    ctx.beginPath();
    ctx.moveTo(150, 440);
    ctx.lineTo(225, 550);
    ctx.lineTo(195, 550);
    ctx.lineTo(130, 470);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(300, 440);
    ctx.lineTo(225, 550);
    ctx.lineTo(255, 550);
    ctx.lineTo(320, 470);
    ctx.closePath();
    ctx.fill();

    // Medal center
    ctx.fillStyle = '#dc2626'; // Maroon Ribbon Center
    ctx.beginPath();
    ctx.arc(225, 525, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f59e0b'; // Golden medal border
    ctx.beginPath();
    ctx.arc(225, 525, 14, 0, Math.PI * 2);
    ctx.fill();

    // 3. Draw Neck & Head/Face
    ctx.fillStyle = '#ffedd5'; // Light natural skin tone
    ctx.fillRect(205, 330, 40, 75); // Neck

    // Face oval
    ctx.beginPath();
    ctx.arc(225, 275, 65, 0, Math.PI * 2);
    ctx.fill();

    // Hair outline
    ctx.fillStyle = '#1c1917'; // Dark hair
    ctx.beginPath();
    ctx.arc(225, 255, 68, Math.PI, 0); 
    ctx.fill();
    ctx.fillRect(158, 245, 16, 60); // Sideburn left
    ctx.fillRect(276, 245, 16, 60); // Sideburn right

    // Big happy eyes
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(202, 268, 6, 0, Math.PI * 2);
    ctx.arc(248, 268, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rosy cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.35)'; // rosy pink
    ctx.beginPath();
    ctx.arc(182, 285, 12, 0, Math.PI * 2);
    ctx.arc(268, 285, 12, 0, Math.PI * 2);
    ctx.fill();

    // Warm friendly smile
    ctx.strokeStyle = '#be123c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(225, 292, 16, 0, Math.PI);
    ctx.stroke();

    // Eyebrows
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(192, 254);
    ctx.quadraticCurveTo(202, 248, 212, 256);
    ctx.moveTo(258, 254);
    ctx.quadraticCurveTo(248, 248, 238, 256);
    ctx.stroke();

    // Nose
    ctx.strokeStyle = '#fdbb2d';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(225, 260);
    ctx.lineTo(225, 280);
    ctx.lineTo(221, 280);
    ctx.stroke();

    // 4. Draw Graduation Cap (Toga)
    ctx.fillStyle = '#0f172a'; // Black mortarboard
    // Diamond top shape
    ctx.beginPath();
    ctx.moveTo(225, 155); // Top vertex
    ctx.lineTo(345, 195); // Right vertex
    ctx.lineTo(225, 235); // Bottom vertex
    ctx.lineTo(105, 195); // Left vertex
    ctx.closePath();
    ctx.fill();

    // Skull cover cap
    ctx.fillRect(180, 203, 90, 22);

    // Golden Yellow tassel line
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(225, 195);
    ctx.lineTo(300, 215); // hang right
    ctx.lineTo(300, 255); // drop down the edge
    ctx.stroke();
    
    // Tassel bottom brush
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(294, 255, 12, 20);

    return canvas.toDataURL('image/png');
  };

  // Handling student file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setStudentImageName(file.name.split('.')[0]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setRawImageSrc(dataUrl);

      const img = new Image();
      img.src = dataUrl;
      img.crossOrigin = "anonymous";
      img.onload = () => {
        setStudentImage(img);
        // Deduce target background color automatically based on top-left pixel
        detectInitialBackgroundColor(img);
        
        // Reset transformation parameters
        setOffsetX(0);
        setOffsetY(40);
        setScale(80);
        setRotation(0);
        setIsProcessing(false);
      };
    };
    reader.readAsDataURL(file);
  };

  // Automatically samples background color from corners of newly loaded image
  const detectInitialBackgroundColor = (img: HTMLImageElement) => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = 100;
    tempCanvas.height = 100;
    const tempCtx = tempCanvas.getContext('2d');
    if (!tempCtx) return;

    tempCtx.drawImage(img, 0, 0, 100, 100);
    // Take sample from top left corner for backdrop auto chroma-keying
    const pixel = tempCtx.getImageData(5, 5, 1, 1).data;
    setKeyColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
  };

  // Uploading a custom background template
  const handleCustomTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        setCustomBgImage(img);
        setSelectedTemplate('custom');
      };
    };
    reader.readAsDataURL(file);
  };

  // Clicking on Raw Thumbnail Canvas to sample chroma key color (eyedropper)
  const handleRawCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = rawPreviewCanvasRef.current;
    if (!canvas || !studentImage) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Map click coordinates of canvas back to native image bounds
    const nativeX = (clickX / rect.width) * canvas.width;
    const nativeY = (clickY / rect.height) * canvas.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pixel = ctx.getImageData(nativeX, nativeY, 1, 1).data;
    setKeyColor({ r: pixel[0], g: pixel[1], b: pixel[2] });
    setEyedropperActive(false);
  };

  // Core Compositing and Chroma Key Engine!
  useEffect(() => {
    const mainCanvas = mainCanvasRef.current;
    if (!mainCanvas) return;

    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    const w = 900;
    const h = 1200;
    mainCanvas.width = w;
    mainCanvas.height = h;

    // 1. Draw Template and golden frame
    renderTemplateOnContext(ctx, w, h);

    // 2. Process student image cutout and apply transformations
    if (studentImage) {
      // Create offscreen canvas for chroma key calculation
      const cutCanvas = document.createElement('canvas');
      const imgW = studentImage.width;
      const imgH = studentImage.height;
      cutCanvas.width = imgW;
      cutCanvas.height = imgH;

      const cutCtx = cutCanvas.getContext('2d')!;
      cutCtx.drawImage(studentImage, 0, 0, imgW, imgH);

      // Fetch pixel array for color mapping
      const imgData = cutCtx.getImageData(0, 0, imgW, imgH);
      const data = imgData.data;

      // Extract options to avoid closures
      const tr = keyColor.r;
      const tg = keyColor.g;
      const tb = keyColor.b;
      const tol = tolerance;
      const fth = feather;
      const spl = spillReduction;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Euclidean three dimensional RGB color distance
        const dist = Math.sqrt(
          (r - tr) * (r - tr) +
          (g - tg) * (g - tg) +
          (b - tb) * (b - tb)
        );

        let outAlpha = a;

        if (dist < tol) {
          outAlpha = 0;
        } else if (dist < tol + fth) {
          const transFactor = (dist - tol) / fth;
          outAlpha = Math.round(transFactor * a);
        }

        // Apply Spill Reduction: Neuturalise matching background color fringing (halo effects in hair)
        if (spl > 0 && dist < tol * 2.3) {
          const factor = 1 - Math.min(1, dist / (tol * 2.3));
          const blendPower = factor * (spl / 100);
          
          // Neutralise color toward gray scale luminance
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          data[i] = Math.round(r * (1 - blendPower) + luminance * blendPower);
          data[i + 1] = Math.round(g * (1 - blendPower) + luminance * blendPower);
          data[i + 2] = Math.round(b * (1 - blendPower) + luminance * blendPower);
        }

        data[i + 3] = outAlpha;
      }

      // Write processed transparency data to cutout canvas
      cutCtx.putImageData(imgData, 0, 0);

      // Draw cutout to main display canvas with transformation relative to bottom-center anchor
      ctx.save();
      const centerX = w / 2 + offsetX;
      const centerY = h + offsetY;

      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);

      // Scale proportionally relative to height of canvas
      const scaleRatio = (h / imgH) * (scale / 100);
      const drawW = imgW * scaleRatio;
      const drawH = imgH * scaleRatio;

      // Anchor point is at bottom-center of cutout
      ctx.drawImage(cutCanvas, -drawW / 2, -drawH, drawW, drawH);
      ctx.restore();
    }

    // 3. Draw Watermarks & Dynamic Names
    if (showWatermark) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 2;

      // Draw Academic Student Name Label
      if (studentName.trim() !== "") {
        ctx.font = "bold 26px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "#fef08a"; // Soft light yellow
        ctx.textAlign = "center";
        ctx.fillText(studentName.toUpperCase(), w / 2, h - 85);

        ctx.font = "500 18px 'JetBrains Mono', monospace";
        ctx.fillStyle = "#e2e8f0";
        ctx.fillText(`${studentClass} • SMP IP Almuhibbin`, w / 2, h - 55);
      } else {
        // Default official footer label
        ctx.font = "500 18px 'Space Grotesk', sans-serif";
        ctx.fillStyle = "rgba(255, 255, 255, 0.65)";
        ctx.textAlign = "center";
        ctx.fillText("SMP IP Almuhibbin - Wisuda Angkatan IX", w / 2, h - 65);
      }
      ctx.restore();
    }

    // 4. Subtle watermark logo at the extreme top margin
    ctx.save();
    ctx.font = "600 13px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.textAlign = "left";
    ctx.fillText("pitulikurmedia | Otomasi", 48, 52);
    ctx.restore();

  }, [
    studentImage, 
    selectedTemplate, 
    customBgImage, 
    keyColor, 
    tolerance, 
    feather, 
    spillReduction,
    scale, 
    offsetX, 
    offsetY, 
    rotation,
    studentName, 
    studentClass, 
    showGoldBorder, 
    showWatermark
  ]);

  // Handle building thumbnail preview canvas of raw photograph
  useEffect(() => {
    const rawCanvas = rawPreviewCanvasRef.current;
    if (!rawCanvas || !studentImage) return;

    const ctx = rawCanvas.getContext('2d');
    if (!ctx) return;

    // Use a fixed smaller size for colors picking
    const w = studentImage.width;
    const h = studentImage.height;
    rawCanvas.width = 280;
    rawCanvas.height = (280 * h) / w;

    ctx.drawImage(studentImage, 0, 0, rawCanvas.width, rawCanvas.height);
  }, [studentImage]);

  // Click-to-drag handlers on dynamic studio editor monitor
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!studentImage) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !studentImage) return;
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    // Translate mouse movement factor to canvas space coordinates
    const scaleFactorX = 900 / rect.width;
    const scaleFactorY = 1200 / rect.height;

    const deltaX = (e.clientX - dragStart.x) * scaleFactorX;
    const deltaY = (e.clientY - dragStart.y) * scaleFactorY;

    setOffsetX(prev => prev + deltaX);
    setOffsetY(prev => prev + deltaY);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  // Dynamic Alignment Quick buttons
  const alignSubject = (type: 'center-bottom' | 'fit-width' | 'fit-height' | 'reset') => {
    if (!studentImage) return;
    const imgH = studentImage.height;
    const imgW = studentImage.width;

    if (type === 'center-bottom') {
      setOffsetX(0);
      setOffsetY(25); // Slighly offset upwards for text watermark margin comfort
      setScale(80);
      setRotation(0);
    } else if (type === 'fit-width') {
      setOffsetX(0);
      setOffsetY(0);
      // Fit to fill 100% template width
      const scaleNeeded = (900 / imgW) / (1200 / imgH) * 100;
      setScale(Math.round(scaleNeeded));
      setRotation(0);
    } else if (type === 'fit-height') {
      setOffsetX(0);
      setOffsetY(0);
      setScale(100);
      setRotation(0);
    } else if (type === 'reset') {
      setOffsetX(0);
      setOffsetY(0);
      setScale(75);
      setRotation(0);
    }
  };

  // Copying helper code to clipboards
  const handleCopyText = (text: string, type: 'py' | 'req') => {
    navigator.clipboard.writeText(text);
    if (type === 'py') {
      setCopiedAppPy(true);
      setTimeout(() => setCopiedAppPy(false), 2000);
    } else {
      setCopiedReqs(true);
      setTimeout(() => setCopiedReqs(false), 2000);
    }
  };

  // Triggers immediate browser secure JPEG higher quality download
  const downloadFinalImage = () => {
    const canvas = mainCanvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    // Ensure clean alphanumeric naming standard compatible with downloads
    const sanitizeName = (studentName.trim() !== "") 
      ? studentName.trim().replace(/[^a-zA-Z0-9]/g, '_') 
      : studentImageName.replace(/[^a-zA-Z0-9]/g, '_');

    link.download = `Wisuda_pitulikurmedia_${sanitizeName}.jpg`;
    // Output high quality compression 92% JPEG format 
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#080d19] text-slate-100 font-sans antialiased selection:bg-amber-500 selection:text-slate-950">
      
      {/* BRAND HEADER BANNER */}
      <header className="relative bg-gradient-to-b from-[#0e172a] to-[#080d19] border-b border-[#1e293b] py-6 px-4 md:px-8 text-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-700" />
        
        {/* Abstract light aura decoration */}
        <div className="absolute top-[-100px] left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-gradient-to-b from-blue-900/20 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="p-1 px-3 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs rounded-full uppercase tracking-widest flex items-center gap-1">
              <Sparkle className="w-3 h-3 fill-amber-400" /> Portal Kelas 9
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-4xl text-slate-100 tracking-tight leading-none mb-1">
            🎓 Portal Foto Wisuda <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">pitulikurmedia</span>
          </h1>
          <p className="font-sans font-medium text-amber-500 text-sm md:text-base tracking-wider uppercase mb-3">
            SMP IP Almuhibbin • Otomasi Background Kilat
          </p>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl mx-auto leading-relaxed">
            Hapus background foto mentah seketika dan satukan ke dalam template wisuda studio resmi dengan kualitas tinggi (High-Res) secara instan tanpa distorsi wajah sedikit pun.
          </p>
        </div>
      </header>

      {/* WORKSPACE NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex items-center justify-center border-b border-slate-800 gap-1 md:gap-4">
          <button 
            id="tab-editor"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
              activeTab === 'editor' 
                ? 'border-amber-500 text-amber-400 bg-slate-900/50' 
                : 'border-transparent text-slate-450 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Studio Edit Foto Wisuda
          </button>
          <button 
            id="tab-blueprint"
            onClick={() => setActiveTab('python')}
            className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-all duration-200 border-b-2 ${
              activeTab === 'python' 
                ? 'border-amber-500 text-amber-400 bg-slate-900/50' 
                : 'border-transparent text-slate-450 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-amber-500" />
            Unduh Blueprint Python (Streamlit)
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* CASE 1: PORTAL STUDIO EDITOR */}
        {activeTab === 'editor' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUMN 1: CONTROL BOARD PANEL (lg:5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* BRAND CARD: CHOOSE FILE */}
              <div className="bg-slate-900/90 border border-slate-800 shadow-xl rounded-xl p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                <h3 className="font-display text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <span className="p-1 px-2 rounded bg-amber-500/10 text-amber-400 font-mono text-xs">01</span>
                  Unggah Foto Mentah & Pilih Template
                </h3>

                {/* FILE DRAG DROP FIELD */}
                <div className="relative group border-2 border-dashed border-slate-700 hover:border-amber-500/50 bg-slate-950/50 rounded-lg p-5 transition-all text-center">
                  <input 
                    type="file" 
                    id="file-upload-input"
                    accept="image/*" 
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
                  />
                  <div className="space-y-2 pointer-events-none">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400 group-hover:text-amber-400 group-hover:bg-slate-800/80 transition-all">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-slate-300">
                      Klik atau Seret Foto Wisuda Mentah
                    </p>
                    <p className="text-xs text-slate-500">
                      Mendukg format JPEG, JPG, PNG (Resolusi direkomendasikan min. 1000px)
                    </p>
                  </div>
                </div>

                {/* DEMO BUTTON AND CURRENT FILE ALERTER */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/60 pt-3">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                    {studentImage ? (
                      <span className="truncate max-w-[150px] font-mono text-[11px]">
                        Foto: {studentImageName}.jpg
                      </span>
                    ) : (
                      <span>Menunggu file foto diunggah...</span>
                    )}
                  </div>
                  <button
                    id="btn-demo-photo"
                    type="button"
                    onClick={handleLoadDemoImage}
                    className="flex items-center gap-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-amber-400 font-medium px-3 py-1.5 rounded border border-slate-700/60 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Gunakan Foto Demo (Green-Screen)
                  </button>
                </div>

                {/* TEMPLATE PICKER PANEL */}
                <div className="mt-5 space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Pilih Template Background Resmi:
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    
                    {/* BLUE TEMPLATE */}
                    <button
                      id="tpl-blue"
                      onClick={() => setSelectedTemplate('blue')}
                      className={`p-2 rounded border text-left flex flex-col justify-between h-16 transition-all relative overflow-hidden ${
                        selectedTemplate === 'blue'
                          ? 'border-amber-500 bg-blue-950/40 shadow-inner'
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-6 h-6 bg-blue-600 rounded-bl" />
                      <span className="text-[11px] font-bold text-slate-200">Biru Studio</span>
                      <span className="text-[9px] text-slate-500 font-medium">Klasik Resmi</span>
                    </button>

                    {/* RED TEMPLATE */}
                    <button
                      id="tpl-red"
                      onClick={() => setSelectedTemplate('red')}
                      className={`p-2 rounded border text-left flex flex-col justify-between h-16 transition-all relative overflow-hidden ${
                        selectedTemplate === 'red'
                          ? 'border-amber-500 bg-red-950/40 shadow-inner'
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-6 h-6 bg-red-700 rounded-bl" />
                      <span className="text-[11px] font-bold text-slate-200">Merah Studio</span>
                      <span className="text-[9px] text-slate-500 font-medium">Saka Prestasi</span>
                    </button>

                    {/* LIBRARY TEMPLATE */}
                    <button
                      id="tpl-library"
                      onClick={() => setSelectedTemplate('library')}
                      className={`p-2 rounded border text-left flex flex-col justify-between h-16 transition-all relative overflow-hidden ${
                        selectedTemplate === 'library'
                          ? 'border-amber-500 bg-yellow-950/30 shadow-inner'
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-6 h-6 bg-amber-800 rounded-bl" />
                      <span className="text-[11px] font-bold text-slate-200">Perpustakaan</span>
                      <span className="text-[9px] text-slate-500 font-medium">Lensa Akademik</span>
                    </button>

                    {/* GRAY TEMPLATE */}
                    <button
                      id="tpl-gray"
                      onClick={() => setSelectedTemplate('gray')}
                      className={`p-2 rounded border text-left flex flex-col justify-between h-16 transition-all relative overflow-hidden ${
                        selectedTemplate === 'gray'
                          ? 'border-amber-500 bg-slate-850/40 shadow-inner'
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <div className="absolute top-0 right-0 w-6 h-6 bg-slate-650 rounded-bl" />
                      <span className="text-[11px] font-bold text-slate-200">Charcoal Gray</span>
                      <span className="text-[9px] text-slate-500 font-medium">Aesthetic Portrait</span>
                    </button>

                  </div>

                  {/* CUSTOM CHOOSE FILE FOR BACKGROUND TARGET */}
                  <div className="pt-2">
                    <button
                      onClick={() => document.getElementById('bg-custom-upload')?.click()}
                      className={`w-full p-2.5 rounded border text-xs font-medium flex items-center justify-between transition-all ${
                        selectedTemplate === 'custom'
                          ? 'border-amber-500 bg-amber-500/10 text-amber-300'
                          : 'border-slate-800 bg-slate-950/20 text-slate-400 hover:border-slate-700 hover:text-slate-250'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
                        {customBgImage ? "✔️ Pakai Latar Belakang Custom Lain" : "Unggah Latar Belakang Custom Sendiri"}
                      </span>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">File (.JPG)</span>
                    </button>
                    <input 
                      type="file" 
                      id="bg-custom-upload"
                      accept="image/*"
                      onChange={handleCustomTemplateUpload} 
                      className="hidden" 
                    />
                  </div>
                </div>

              </div>

              {/* CARD STEP 02: REMOVE BACKGROUND (CHROMA KEY CHANGER) */}
              <div className={`bg-slate-900/90 border border-slate-800 shadow-xl rounded-xl p-5 relative overflow-hidden transition-all ${!studentImage ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-base font-bold text-slate-200 flex items-center gap-2">
                    <span className="p-1 px-2 rounded bg-indigo-500/10 text-indigo-400 font-mono text-xs">02</span>
                    Chroma Key (Ekstraksi Background Otomatis)
                  </h3>
                  <Info className="w-4 h-4 text-indigo-400 hover:text-indigo-300 cursor-pointer" title="Cara Kerja: Menghilangkan warna latar asli dari foto Anda" />
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                  Pilih warna background asli foto Anda untuk dihapus secara instan. Atur sensitivitas (toleransi) agar rambut dan tepi bahu terpotong rapi tanpa terdistorsi.
                </p>

                {/* PRESETS AUTO BACKGROUND SELECT */}
                <div className="space-y-3 mb-5">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest block">
                    Pilih Target Warna Latar:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_REMOVE_COLORS.map((preset) => (
                      <button
                        key={preset.hex}
                        onClick={() => {
                          setKeyColor({ r: preset.r, g: preset.g, b: preset.b });
                          setEyedropperActive(false);
                        }}
                        className={`flex items-center gap-2 p-2 rounded text-xs border text-left transition-all ${
                          keyColor.r === preset.r && keyColor.g === preset.g && keyColor.b === preset.b
                            ? 'border-indigo-500 bg-indigo-500/10 font-semibold text-indigo-400'
                            : 'border-slate-800 bg-slate-950/30 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-700" style={{ backgroundColor: preset.hex }} />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COLOR SAMPLING EYE DROPPER AND COLOR SELECTION DISPLAY */}
                <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      <div 
                        className="w-10 h-10 rounded border border-slate-700 glow-gold" 
                        style={{ backgroundColor: `rgb(${keyColor.r}, ${keyColor.g}, ${keyColor.b})` }} 
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">Kode RGB Aktif:</span>
                      <span className="text-xs font-mono font-bold text-slate-300">
                        rgb({keyColor.r}, {keyColor.g}, {keyColor.b})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setEyedropperActive(!eyedropperActive)}
                    className={`w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded text-xs font-medium cursor-pointer transition-all ${
                      eyedropperActive 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    {eyedropperActive ? "Klik Pada Foto di Bawah" : "Pipet Eyedropper"}
                  </button>
                </div>

                {/* SLIDERS SECTION */}
                <div className="mt-5 space-y-4">
                  
                  {/* SLIDER 1: TOLERANCE */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Sensitivitas Jarak Warna (Toleransi)
                      </span>
                      <span className="font-mono text-xs font-bold text-indigo-400">{tolerance}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="150" 
                      value={tolerance}
                      onChange={(e) => setTolerance(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                    />
                    <div className="flex justify-between text-[10px] text-slate-650">
                      <span>Rendah (Sedikit rontok)</span>
                      <span>Sempurna</span>
                      <span>Tinggi (Kehilangan subjek)</span>
                    </div>
                  </div>

                  {/* SLIDER 2: FEATHER */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Kehalusan Tepi (Edge Feather)
                      </span>
                      <span className="font-mono text-xs font-bold text-indigo-400">{feather} px</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="60" 
                      value={feather}
                      onChange={(e) => setFeather(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                    />
                  </div>

                  {/* SLIDER 3: SPILL REDUCTION */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                        Reduksi Gangguan Bocoran Warna (Chroma Spill)
                      </span>
                      <span className="font-mono text-xs font-bold text-indigo-400">{spillReduction}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={spillReduction}
                      onChange={(e) => setSpillReduction(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-indigo-500" 
                    />
                  </div>

                </div>

                {/* MINI TARGET COLOR SAMPLING SCREEN */}
                {studentImage && (
                  <div className="mt-5 border-t border-slate-800 pt-4 space-y-2">
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase">
                      🖥️ Klik Area Latar Foto ini untuk Menghapus Warnanya:
                    </span>
                    <div className="relative inline-block overflow-hidden rounded border border-slate-800 bg-slate-950 max-w-[280px] mx-auto">
                      <canvas 
                        ref={rawPreviewCanvasRef} 
                        onClick={handleRawCanvasClick}
                        className={`block cursor-crosshair transition-all ${
                          eyedropperActive ? 'ring-2 ring-rose-500 scale-[1.01]' : 'opacity-90 hover:opacity-100'
                        }`} 
                        title="Klik pada bagian background foto untuk menghapusnya."
                      />
                      {eyedropperActive && (
                        <div className="absolute inset-0 bg-rose-500/10 pointer-events-none flex items-center justify-center">
                          <span className="bg-rose-600 text-white font-semibold text-[10px] px-2 py-1 rounded shadow-lg animate-bounce">
                            🎯 Eyedropper Aktif - Klik Warna Latar!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>

              {/* CARD STEP 03: POSITIONING ADJUSTMENT DETAILS */}
              <div className={`bg-slate-900/90 border border-slate-800 shadow-xl rounded-xl p-5 relative overflow-hidden transition-all ${!studentImage ? 'opacity-40 pointer-events-none' : ''}`}>
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-600" />
                <h3 className="font-display text-base font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <span className="p-1 px-2 rounded bg-amber-600/13 text-amber-500 font-mono text-xs">03</span>
                  Transformasi Posisi, Watermark & Identitas Siswa
                </h3>

                {/* SCALING & COORINATE CONTROLS */}
                <div className="space-y-4">
                  
                  {/* SLIDER SCALE */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Skala Subjek (Ukuran Foto)</span>
                      <span className="font-mono text-xs font-bold text-amber-500">{scale}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="20" 
                      max="150" 
                      value={scale}
                      onChange={(e) => setScale(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                  </div>

                  {/* SLIDERS COORDINATES (GESER X/Y) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-450 block font-medium">Geser Horisontal (X):</span>
                      <input 
                        type="range" 
                        min="-250" 
                        max="250" 
                        value={offsetX}
                        onChange={(e) => setOffsetX(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded accent-slate-300" 
                      />
                      <div className="flex justify-between text-[9px] text-slate-600">
                        <span>Piksel: {offsetX}px</span>
                        <button onClick={() => setOffsetX(0)} className="hover:text-amber-500">Reset</button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs text-slate-450 block font-medium">Geser Vertikal (Y):</span>
                      <input 
                        type="range" 
                        min="-350" 
                        max="350" 
                        value={offsetY}
                        onChange={(e) => setOffsetY(parseInt(e.target.value))}
                        className="w-full h-1 bg-slate-850 rounded accent-slate-300" 
                      />
                      <div className="flex justify-between text-[9px] text-slate-600">
                        <span>Piksel: {offsetY}px</span>
                        <button onClick={() => setOffsetY(30)} className="hover:text-amber-500">Reset</button>
                      </div>
                    </div>
                  </div>

                  {/* ROTATION SLIDER */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Rotasi Kemiringan (Tubuh/Kepala)</span>
                      <span className="font-mono text-xs font-semibold text-amber-500">{rotation}°</span>
                    </div>
                    <input 
                      type="range" 
                      min="-45" 
                      max="45" 
                      value={rotation}
                      onChange={(e) => setRotation(parseInt(e.target.value))}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer accent-amber-500" 
                    />
                  </div>

                  {/* INSTANT CORRECTION ALIGNMENT BUTTONS */}
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                      Arahkan Letak Cepat:
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        onClick={() => alignSubject('center-bottom')}
                        className="p-1 px-2 text-[10px] bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 rounded transition-all"
                      >
                        Tengah Bawah
                      </button>
                      <button
                        onClick={() => alignSubject('fit-width')}
                        className="p-1 px-2 text-[10px] bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 rounded transition-all"
                      >
                        Pas Lebar
                      </button>
                      <button
                        onClick={() => alignSubject('fit-height')}
                        className="p-1 px-2 text-[10px] bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 rounded transition-all"
                      >
                        Pas Tinggi
                      </button>
                      <button
                        onClick={() => alignSubject('reset')}
                        className="p-1 px-2 text-[10px] bg-slate-950 border border-slate-800 hover:border-amber-500 text-slate-300 rounded transition-all flex items-center justify-center gap-0.5"
                      >
                        <Undo className="w-2.5 h-2.5" /> Reset
                      </button>
                    </div>
                  </div>

                  {/* WATERMARK LABELS AND CUSTOM CARD */}
                  <div className="border-t border-slate-800/80 pt-4 space-y-4">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                      🎨 Edit Tampilan & Identitas:
                    </span>

                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Nama Lengkap Siswa (Akan Ditampilkan):</label>
                        <input
                          type="text"
                          maxLength={36}
                          value={studentName}
                          onChange={(e) => setStudentName(e.target.value)}
                          placeholder="Contoh: AHMAD MAULANA HADI"
                          className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 px-3 py-2 text-xs rounded text-slate-200 uppercase outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-slate-400 block mb-1">Kelas / Rombel:</label>
                          <input
                            type="text"
                            value={studentClass}
                            onChange={(e) => setStudentClass(e.target.value)}
                            placeholder="9-A"
                            className="w-full bg-slate-950/80 border border-slate-800 focus:border-amber-500 px-3 py-2 text-xs rounded text-slate-200 outline-none transition-all"
                          />
                        </div>
                        <div className="flex flex-col justify-end space-y-2 pb-1.5">
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={showGoldBorder} 
                              onChange={(e) => setShowGoldBorder(e.target.checked)}
                              className="rounded w-3.5 h-3.5 border-slate-800 bg-slate-950 accent-amber-500 cursor-pointer" 
                            />
                            <span className="text-xs text-slate-300">Pakai Bingkai Emas</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input 
                              type="checkbox" 
                              checked={showWatermark} 
                              onChange={(e) => setShowWatermark(e.target.checked)}
                              className="rounded w-3.5 h-3.5 border-slate-800 bg-slate-950 accent-amber-500 cursor-pointer" 
                            />
                            <span className="text-xs text-slate-300">Tampilkan Nama</span>
                          </label>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* COLUMN 2: STUDIO MONITOR INTERACTIVE PREVIEW (lg:7) */}
            <div className="lg:col-span-7 flex flex-col items-center">
              
              {/* STUDIO CARD INNER MONITOR SHELL */}
              <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-2xl relative">
                
                {/* STUDIO DECORATOR LIGHTS */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-mono tracking-widest text-rose-500 uppercase font-bold">
                      STUDIO LIVE MONITOR
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    Siswa Kelas 9 SMP IP Almuhibbin
                  </div>
                </div>

                {/* INTERACTIVE COMPOSITING CANVAS BOX */}
                <div className="w-full flex justify-center bg-slate-950 rounded-lg p-2 md:p-4 border border-slate-800/65 relative overflow-hidden group">
                  
                  {/* Outer shadows background decor */}
                  <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

                  {/* PHYSICAL CANVAS OBJECT */}
                  <div className="relative">
                    <canvas
                      ref={mainCanvasRef}
                      onMouseDown={handleCanvasMouseDown}
                      onMouseMove={handleCanvasMouseMove}
                      onMouseUp={handleCanvasMouseUpOrLeave}
                      onMouseLeave={handleCanvasMouseUpOrLeave}
                      className="block max-w-full h-auto cursor-all-scroll rounded-md shadow-2xl shadow-indigo-950/40 border border-slate-800 border-dashed"
                      style={{ 
                        width: '100%', 
                        maxWidth: '430px', 
                        aspectRatio: '3/4', 
                        touchAction: 'none' 
                      }}
                      title="Saran: Tarik langsung subjek gambar dengan mouse/jari Anda di atas untuk mengatur posisinya sesuai keinginan!"
                    />

                    {/* INTERACTIVE OVERLAYS FOR COORDS FEEDBACK AND HELPERS */}
                    {studentImage && (
                      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-slate-400 font-mono flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-slate-800">
                        <MousePointer className="w-2.5 h-2.5 text-amber-500" />
                        Tarik foto untuk menggeser posisi
                      </div>
                    )}
                  </div>

                  {!studentImage && (
                    <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center z-10">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-450 mb-3 animate-bounce">
                        <ImageIcon className="w-8 h-8 text-amber-500" />
                      </div>
                      <h4 className="font-display font-medium text-slate-200">Menunggu Unggahan Foto Anda</h4>
                      <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed">
                        Silakan unggah foto wisuda Anda dari HP/Laptop atau pakai tombol <b className="text-amber-500">Gunakan Foto Demo</b> untuk mencoba fitur otomasi background.
                      </p>
                      
                      <button
                        onClick={handleLoadDemoImage}
                        className="mt-4 flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-lg shadow-amber-950/20 transition-all cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 fill-white" /> Pakai Foto Demo Sekarang
                      </button>
                    </div>
                  )}

                  {isProcessing && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
                      <div className="w-12 h-12 rounded-full border-2 border-t-amber-500 border-slate-800 animate-spin mb-3" />
                      <h4 className="text-sm font-semibold text-slate-300">Memproses Gambar...</h4>
                      <p className="text-xs text-slate-500 mt-1">Sistem sedang merender tepi dan melakukan eliminasi warna piksel.</p>
                    </div>
                  )}

                </div>

                {/* INFO LABELS ABOUT DOWNLOADS */}
                <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-450 bg-slate-950/40 p-2.5 rounded-lg border border-slate-850">
                  <span className="p-0.5 rounded bg-amber-500/10 text-amber-500 font-mono">SPEK FINISH:</span>
                  <span>Rasio Aspek 3:4 Portrait • High-Res JPEG • Output 900 x 1200 px • 100% Akurasi Tubuh & Wajah • Siap Cetak</span>
                </div>

                {/* PRIMARY ACTION: EXPORT COMPOSITION BUTTON */}
                <div className="mt-5">
                  <button
                    id="btn-download-wisuda"
                    type="button"
                    onClick={downloadFinalImage}
                    disabled={!studentImage}
                    className={`w-full group py-4 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-xl flex items-center justify-center gap-2.5 cursor-pointer ${
                      studentImage 
                        ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 shadow-amber-950/20 hover:scale-[1.01] active:scale-[0.99] border-t border-yellow-300/30' 
                        : 'bg-slate-800 text-slate-550 border border-slate-850 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <Download className={`w-5 h-5 ${studentImage ? 'text-slate-950 group-hover:translate-y-0.5 transition-transform' : ''}`} />
                    <span>DOWNLOAD PORTRAIT WISUDA RESMI [HIGH-RES JPG]</span>
                  </button>
                  <p className="text-center text-[11px] text-slate-500 mt-2 font-mono">
                    Nama File Keluaran: <span className="text-slate-400">Wisuda_pitulikurmedia_{studentName ? studentName.trim().replace(/[^a-zA-Z0-9]/g, '_').toUpperCase() : 'siswa'}.jpg</span>
                  </p>
                </div>

              </div>

              {/* TIPS BANNER */}
              <div className="w-full mt-6 bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 flex gap-3 text-xs text-slate-400">
                <Info className="w-5 h-5 text-amber-500 shrink-0" />
                <div className="space-y-1">
                  <p className="font-semibold text-slate-300">💡 Tips Studio Pencetakan Wisuda:</p>
                  <p className="leading-relaxed">
                    Untuk pencetakan terbaik ukuran <b>4R / 10R Pajang</b>, isi Nama Lengkap Siswa di kolom kiri agar tercetak label emas beresolusi tinggi di dasar foto wisuda Anda secara elegan.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* CASE 2: BLUEPRINT SYSTEM DOWNLOAD FOR STREAMLIT */}
        {activeTab === 'python' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="font-display font-bold text-xl text-slate-100 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                Informasi Deployment Streamlit Cloud
              </h2>
              <p className="text-sm text-slate-450 mt-2 leading-relaxed">
                Anda diminta mendeploy sistem ini ke **Streamlit Community Cloud** menggunakan library pemproses gambar Python <code className="text-slate-200 bg-slate-950 px-1 py-0.5 rounded font-mono text-xs">rembg</code> murni. Kami telah membuat seluruh file blueprintnya untuk Anda. Anda tinggal membuat file dengan nama yang sama di repositori GitHub Anda dan mengaitkannya ke Streamlit Cloud!
              </p>
              
              <div className="mt-4 p-4 bg-slate-950 rounded border border-slate-850 flex items-start gap-3">
                <Award className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400 space-y-1">
                  <p className="font-bold text-slate-200 uppercase tracking-wide">💡 KELEBIHAN MODEL PYTHON STREAMLIT REMBG MURNI:</p>
                  <p>1. Menghapus background asli tipe apa saja (tidak terbatas pada greenscreen) menggunakan model pemotretan ONNX.</p>
                  <p>2. Proses pemotongan otomatis tanpa distorsi wajah yang menjaga integritas struktur wisudawan 100% akurat.</p>
                  <p>3. Format unduhan file JPEG kualitas tinggi dengan kualitas 95% kompresi.</p>
                </div>
              </div>
            </div>

            {/* BLOCK CODE 1: App.py */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-xs font-mono font-bold text-slate-300">app.py</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(appPyCode, 'py')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded transition-all cursor-pointer border border-slate-800"
                >
                  {copiedAppPy ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-mono">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-950 overflow-x-auto text-[11px] md:text-xs">
                <pre className="font-mono text-slate-300 whitespace-pre leading-relaxed">
                  {appPyCode}
                </pre>
              </div>
            </div>

            {/* BLOCK CODE 2: Requirements.txt */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950 border-b border-slate-850">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-bold text-slate-300">requirements.txt</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(requirementsTxtCode, 'req')}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded transition-all cursor-pointer border border-slate-800"
                >
                  {copiedReqs ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-mono">Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4 bg-slate-950 overflow-x-auto text-[11px] md:text-sm">
                <pre className="font-mono text-slate-300 whitespace-pre leading-relaxed">
                  {requirementsTxtCode}
                </pre>
              </div>
            </div>

            {/* MANUAL BOOK DEPLOY GUIDE */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5">
              <h4 className="font-display font-bold text-slate-200 text-sm mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" /> Panduan deployment cepat ke Streamlit Cloud:
              </h4>
              <ol className="list-decimal list-inside text-xs text-slate-400 space-y-2 leading-relaxed pl-1">
                <li>Buka akun GitHub Anda dan buatlah repositori baru bernama <code className="text-amber-500 bg-slate-950 px-1 py-0.5 rounded font-mono">pitulikurmedia-wisuda</code>.</li>
                <li>Buat file baru di repositori tersebut bernama <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded font-mono">app.py</code> lalu tempelkan kode di atas.</li>
                <li>Buat pula file bernama <code className="text-slate-300 bg-slate-900 px-1 py-0.5 rounded font-mono">requirements.txt</code> dan isi dengan baris dependencies di atas.</li>
                <li>Unggah file template wisuda favorit sekolah Anda ke repositori tersebut dengan nama <code className="text-slate-300 bg-slate-900 px-1 py-0.5 text-amber-500 rounded font-mono font-semibold">template.jpg</code>.</li>
                <li>Hubungkan repositori Anda ke akun <a href="https://share.streamlit.io" target="_blank" rel="noopener noreferrer" className="text-amber-400 underline hover:text-amber-300">Streamlit Share</a>, klik tombol <b>Deploy</b>, lalu pilih branch utama Anda. Aplikasi wisuda otomatis Anda selesai dideploy dalam 2 menit!</li>
              </ol>
            </div>

          </div>
        )}

      </main>

      {/* FOOTER WATERMARK CREDITS */}
      <footer className="border-t border-slate-900 bg-slate-950/20 py-8 px-4 text-center mt-12 text-slate-600 text-xs text-slate-500">
        <div className="max-w-4xl mx-auto space-y-1 font-mono">
          <p>© 2026 pitulikurmedia Wisuda. All rights reserved.</p>
          <p>Disiapkan eksklusif untuk Siswa Kelas 9 SMP IP Almuhibbin.</p>
        </div>
      </footer>

    </div>
  );
}
