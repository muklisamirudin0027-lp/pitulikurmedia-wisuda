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

# Judul Utama dan Branding
st.markdown("<h1 style='text-align: center; color: #1e3a8a;'>🎓 Portal Foto Wisuda pitulikurmedia</h1>", unsafe_allow_html=True)
st.markdown("<h3 style='text-align: center; color: #b45309;'>SMP IP Almuhibbin</h3>", unsafe_allow_html=True)
st.write("---")

# Deskripsi instruksi bagi siswa
st.markdown("""
Selamat datang di **Portal Mandiri pitulikurmedia**! 
Layanan ini dirancang khusus untuk memotong background foto mentah Anda dan menggantinya dengan template latar belakang wisuda resmi secara otomatis.

**Petunjuk Penggunaan:**
1. Siapkan foto wisuda mentah Anda (pastikan pencahayaan cukup dan wajah terlihat jelas).
2. Unggah foto Anda pada panel di bawah ini (format `.jpg`, `.jpeg`, atau `.png`).
3. Tunggu sistem memproses dan menggabungkan foto Anda secara otomatis dengan template resmi.
4. Pastikan pratinjau hasil sudah sesuai, lalu klik tombol **Unduh Foto Wisuda** untuk menyimpan file berkualitas tinggi.
""")

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
