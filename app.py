# -*- coding: utf-8 -*-
"""
Aplikasi: pitulikurmedia | Otomasi Foto Wisuda
Fungsi: Mengganti background foto wisuda otomatis bagi siswa SMP IP Almuhibbin.
Author: Senior Python Developer
"""

import os
import streamlit as st
from PIL import Image, ImageDraw, ImageOps
import numpy as np

# Mengatur konfigurasi halaman Streamlit sebelum memuat library berat
st.set_page_config(
    page_title="pitulikurmedia | Otomasi Foto Wisuda",
    page_icon="🎓",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Judul Utama dan Branding dengan Styling Kustom (CSS Injected)
st.markdown("""
<style>
/* Mengimpor font premium Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');

/* Gaya dasar aplikasi agar konsisten dan super modern */
html, body, [data-testid="stAppViewContainer"], [data-testid="stHeader"] {
    font-family: 'Plus Jakarta Sans', sans-serif !important;
}

div[data-testid="stAppViewContainer"] {
    background-color: #090d16 !important;
}

/* Tipografi Heading untuk judul */
h1, h2, h3, h4, h5, h6 {
    font-family: 'Space Grotesk', sans-serif !important;
}

/* Efek Teks Gradasi Emas Berkilau untuk Judul Utama */
.title-container {
    padding: 30px 10px 10px 10px;
    text-align: center;
}

.brand-text {
    font-size: 12px;
    font-weight: 700;
    color: #f59e0b;
    text-transform: uppercase;
    letter-spacing: 3px;
    margin-bottom: 5px;
}

.main-title {
    background: linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #94a3b8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 800;
    font-size: 2.6rem !important;
    letter-spacing: -0.05em;
    margin-bottom: 5px !important;
    line-height: 1.2;
}

.highlight-yellow {
    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

.sub-title {
    background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
    font-size: 1.3rem !important;
    letter-spacing: 2px;
    text-transform: uppercase;
    margin-top: 5px !important;
    margin-bottom: 25px !important;
}

/* Desain Kartu Panduan yang Sleek & Modern */
.card-instruction {
    background: linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
    border: 1px solid rgba(251, 191, 36, 0.15);
    border-radius: 16px;
    padding: 24px;
    margin-bottom: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-title {
    color: #fbbf24;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.step-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.step-item {
    display: flex;
    gap: 15px;
    align-items: flex-start;
}

.step-num {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    color: #0b0f19;
    font-weight: 800;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 0.85rem;
    box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
}

.step-text {
    font-size: 0.95rem;
    color: #cbd5e1;
    line-height: 1.5;
}

/* Mempercantik Input File (File Uploader) Streamlit */
div[data-testid="stFileUploader"] {
    border: 2px dashed rgba(245, 158, 11, 0.25) !important;
    border-radius: 16px !important;
    background-color: rgba(15, 23, 42, 0.7) !important;
    padding: 24px !important;
    transition: all 0.3s ease;
}

div[data-testid="stFileUploader"]:hover {
    border-color: #fbbf24 !important;
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.15);
}

/* Custom Tombol Download */
div.stDownloadButton > button {
    background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important;
    color: #0f172a !important;
    font-weight: 700 !important;
    border: none !important;
    padding: 14px 28px !important;
    border-radius: 12px !important;
    box-shadow: 0 4px 20px rgba(245, 158, 11, 0.3) !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    text-transform: uppercase !important;
    letter-spacing: 1px !important;
}

div.stDownloadButton > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(245, 158, 11, 0.5) !important;
    background: linear-gradient(135deg, #fef08a 0%, #fbbf24 100%) !important;
}

div.stDownloadButton > button:active {
    transform: translateY(1px) !important;
}

/* Sidebar kustomisasi */
div[data-testid="stSidebar"] {
    background-color: #0d1321 !important;
    border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Info Box */
.stAlert {
    border-radius: 12px !important;
    border: 1px solid rgba(251, 191, 36, 0.15) !important;
    background-color: rgba(15, 23, 42, 0.7) !important;
}
</style>

<div class="title-container">
    <div class="brand-text">✨ Portal Kelas 9</div>
    <div class="main-title">Portal Foto Wisuda <span class="highlight-yellow">pitulikurmedia</span></div>
    <div class="sub-title">SMP IP Almuhibbin</div>
</div>
""", unsafe_allow_html=True)

# Deskripsi instruksi bagi siswa dalam bentuk Card yang sleek
st.markdown("""
<div class="card-instruction">
    <div class="card-title">📖 Petunjuk Unggah & Otomasi Latar Belakang</div>
    <div class="step-list">
        <div class="step-item">
            <div class="step-num">1</div>
            <div class="step-text">Siapkan foto wisuda mentah Anda setengah badan (kepala hingga dada) dengan ekspresi tegak lurus terbaik dan pencahayaan yang merata.</div>
        </div>
        <div class="step-item">
            <div class="step-num">2</div>
            <div class="step-text">Unggah file foto Anda pada panel di bawah ini (Format yang didukung: <b>.jpg, .jpeg, atau .png</b>).</div>
        </div>
        <div class="step-item">
            <div class="step-num">3</div>
            <div class="step-text">Sistem secara cerdas dan murni akan melakukan pemotongan latar belakang (background removal) instan tanpa merusak data wajah Anda.</div>
        </div>
        <div class="step-item">
            <div class="step-num">4</div>
            <div class="step-text">Sesuaikan ukuran/posisi foto melalui panel kiri bila dirasa perlu, dan klik tombol <b>Unduh Foto Wisuda</b> apabila pratinjau sudah terlihat memukau.</div>
        </div>
    </div>
</div>
""", unsafe_allow_html=True)


# Fungsi membangkitkan template tiruan berkualitas tinggi jika file lokal template.jpg tidak ditemukan
def generate_fallback_template():
    # Membuat latar belakang gradasi biru studio yang mewah (3:4 ratio - 1200 x 1600 piksel)
    width, height = 1200, 1600
    base = Image.new("RGB", (width, height), "#0f172a") # Slate gelap sebagai base
    draw = ImageDraw.Draw(base)
    
    # Membuat efek radial spotlight di tengah
    for r in range(height, 0, -8):
        # Hitung interpolasi warna dari biru tua kerajaan ke hitam slate
        factor = r / height
        r_color = int(15 + (30 - 15) * (1 - factor))
        g_color = int(23 + (58 - 23) * (1 - factor))
        b_color = int(42 + (113 - 42) * (1 - factor))
        
        # Gambar lingkaran spotlight konsentris
        draw.ellipse(
            [(width//2 - r, height//2 - r), (width//2 + r, height//2 + r)], 
            outline=(r_color, g_color, b_color), 
            width=4
        )
    
    # Tambahkan bingkai emas mewah tipis di tepian
    border_width = 24
    draw.rectangle(
        [(border_width, border_width), (width - border_width, height - border_width)],
        outline="#d97706",  # Emas hangat
        width=6
    )
    
    # Tambahkan watermark branding pitulikurmedia yang elegan di sudut bawah
    try:
        # Jika font default tersedia
        draw.text((width // 2 - 100, height - 70), "pitulikurmedia Wisuda", fill="#94a3b8")
    except Exception:
        pass
        
    return base

# Membuka file template latar belakang wisuda lokal (template.jpg)
template_path = "template.jpg"
template_img = None

try:
    if os.path.exists(template_path):
        template_img = Image.open(template_path)
    else:
        st.warning("⚠️ Template resmi 'template.jpg' tidak ditemukan di direktori lokal.")
        use_fallback = st.checkbox("Gunakan template studio alternatif berkualitas tinggi (Gradasi Blue-Gold)", value=True)
        if use_fallback:
            template_img = generate_fallback_template()
            st.info("💡 Berhasil memuat template gradasi studio biru-emas sebagai cadangan.")
except Exception as e:
    st.error(f"Gagal memuat template: {str(e)}")
    template_img = generate_fallback_template()

# Sidebar untuk pengaturan opsional tambahan
st.sidebar.header("🛠️ Panel Pengaturan Rekomendasi")
scale_factor = st.sidebar.slider("Skala Foto Siswa (%)", min_value=30, max_value=120, value=75, step=5)
offset_y = st.sidebar.slider("Sesuaikan Posisi Vertikal (Piksel)", min_value=-300, max_value=300, value=0, step=10)
offset_x = st.sidebar.slider("Sesuaikan Posisi Horizontal (Piksel)", min_value=-200, max_value=200, value=0, step=5)

# Unggah foto dari siswa
uploaded_file = st.file_uploader(
    "Unggah Foto Mentah Wisuda Anda di Sini",
    type=["png", "jpg", "jpeg"],
    help="Gunakan foto beresolusi tinggi dengan posisi tegak lurus."
)

if uploaded_file is not None and template_img is not None:
    # Mengambil nama file asli untuk penamaan file unduhan nanti
    original_fullname = uploaded_file.name
    filename_without_ext = os.path.splitext(original_fullname)[0]
    
    st.info("⏳ Memuat foto dan mengekstrak subjek... Silakan tunggu sebentar.")
    
    try:
        # Load foto siswa dan perbaiki rotasi otomatis EXIF (wajib untuk foto dari HP agar tidak tidur/miring)
        student_raw = ImageOps.exif_transpose(Image.open(uploaded_file))
        
        # Import rembg secara dinamis di sini agar inisialisasi aplikasi awal lebih cepat
        from rembg import remove
        
        # Lakukan penghapusan background menggunakan rembg murni (TANPA AI GENERATIVE / 100% AKURAT)
        # Mengubah ke numpy array untuk diproses oleh rembg
        student_np = np.array(student_raw)
        # rembg.remove mengembalikan output dengan format RGBA (transparan)
        output_np = remove(student_np)
        # Mengembalikan dari numpy array ke PIL Image
        student_extracted = Image.fromarray(output_np)
        
        st.success("✔️ Proses penghapusan background asli berhasil dilakukan!")
        
        # --- LOGIK COMPOSITING POSISI & UKURAN SECARA PROPORSIONAL ---
        # Mengambil dimensi gambar template
        tmpl_w, tmpl_h = template_img.size
        # Mengambil dimensi gambar subjek terekstrak
        subj_w, subj_h = student_extracted.size
        
        # Hitung rasio aspek untuk resize subjek agar proporsional terhadap template
        # Mengikuti preset skala (%) yang diatur pengguna di sidebar
        ratio = (tmpl_h / subj_h) * (scale_factor / 100.0)
        new_w = int(subj_w * ratio)
        new_h = int(subj_h * ratio)
        
        # Resize subjek menggunakan filter pencitraan berkualitas tinggi (Resampling LANCZOS)
        student_resized = student_extracted.resize((new_w, new_h), Image.Resampling.LANCZOS)
        
        # Menghitung koordinat posisi tempel di tengah bawah secara default
        # x_pos untuk memposisikan subjek persis di tengah sumbu X template
        # y_pos untuk memposisikan dasar subjek di bagian bawah template
        x_pos = (tmpl_w - new_w) // 2 + offset_x
        y_pos = (tmpl_h - new_h) + offset_y
        
        # Salin gambar template agar gambar template asli tidak termutasi pihak ketiga
        composite_result = template_img.copy()
        
        # Menempelkan subjek terekstrak ke atas template menggunakan masking alpha saluran transparansi (RGBA)
        composite_result.paste(student_resized, (x_pos, y_pos), student_resized)
        
        # Mengonversi format akhir ke RGB jika ingin menyimpan dalam resolusi tinggi JPEG
        final_rgb = composite_result.convert("RGB")
        
        st.write("---")
        # Menampilkan Pratinjau Foto Hasil Gabungan ke Layar
        st.image(final_rgb, caption="Pratinjau Hasil - pitulikurmedia", use_container_width=True)
        
        # Menyimpan gambar sementara di Buffer Memory agar bisa diunduh langsung tanpa menulis ke disk
        from io import BytesIO
        img_buffer = BytesIO()
        final_rgb.save(img_buffer, format="JPEG", quality=95)
        byte_data = img_buffer.getvalue()
        
        # Tombol pengunduhan High-Res JPEG
        download_filename = f"Wisuda_pitulikurmedia_{filename_without_ext}.jpg"
        
        st.markdown("<p style='text-align: center; font-size: 1.1em;'><b>Pastikan foto di atas sudah rapi dan pas!</b></p>", unsafe_allow_html=True)
        
        st.download_button(
            label="💾 Unduh Foto Wisuda (High-Res JPEG)",
            data=byte_data,
            file_name=download_filename,
            mime="image/jpeg",
            use_container_width=True
        )
        
        st.balloons()
        
    except Exception as e:
        st.error(f"Terjadi kesalahan saat memproses gambar: {str(e)}")
        st.info("Kiat: Pastikan jenis file foto Anda valid dan tidak rusak.")

elif template_img is None:
    st.error("Gagal menginisialisasi aplikasi karena template dasar latar belakang tidak ditemukan.")
else:
    st.write("")
    st.info("👉 Silakan unggah foto wisuda kepala-ke-dada Anda di atas untuk memulai.")
