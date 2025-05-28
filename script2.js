const fileInput = document.querySelector(".file-input"),
    filterOptions = document.querySelectorAll(".filter button"),
    filterName = document.querySelector(".filter-info .name"),
    filterValue = document.querySelector(".filter-info .value"),
    filterSlider = document.querySelector(".slider input"),
    rotateOptions = document.querySelectorAll(".rotate button"),
    previewImg = document.querySelector(".preview-img img"),
    resetFilterBtn = document.querySelector(".reset-filter"),
    chooseImgBtn = document.querySelector(".choose-img"),
    downloadImageBtn = document.querySelector(".download-img");

let brightness = 100,
    saturation = 100,
    inversion = 0,
    grayscale = 0,
    blur = 0,
    vignette = 0,
    rotate = 0,
    flipHorizontal = 1,
    flipVertical = 1;

// Load Image
const loadImage = () => {
    let file = fileInput.files[0];
    if (!file) return;
    previewImg.src = URL.createObjectURL(file);
    previewImg.addEventListener("load", () => {
        resetFilter();
        document.querySelector(".container").classList.remove("disable");
    });
};

// Apply Filters
const applyFilter = () => {
    previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
    previewImg.style.filter = `
        brightness(${brightness}%) 
        saturate(${saturation}%) 
        invert(${inversion}%) 
        grayscale(${grayscale}%) 
        blur(${blur}px)
    `;
    if (vignette > 0) {
        previewImg.style.boxShadow = `
            inset 0 0 ${vignette * 10}px ${vignette * 20}px rgba(0, 0, 0, 0.7)
        `;
    } else {
        previewImg.style.boxShadow = "none"; // Remove vignette if value is 0
    }
};

// Filter Option Selection
filterOptions.forEach(option => {
    option.addEventListener("click", () => {
        document.querySelector(".active").classList.remove("active");
        option.classList.add("active");
        filterName.innerText = option.innerText;

        filterSlider.value = eval(option.id); // Dynamically set slider value
        filterValue.innerText = option.id === "blur" || option.id === "vignette" 
            ? `${filterSlider.value}px` 
            : `${filterSlider.value}%`;
        filterSlider.max = option.id === "blur" || option.id === "vignette" ? 20 : 200;
    });
});

// Slider Input
filterSlider.addEventListener("input", () => {
    const currentFilter = document.querySelector(".active").id;
    eval(`${currentFilter} = ${filterSlider.value}`); // Update corresponding variable
    filterValue.innerText = filterSlider.max == 20 ? `${filterSlider.value}px` : `${filterSlider.value}%`;
    applyFilter();
});

// Rotation and Flip Options
rotateOptions.forEach(option => {
    option.addEventListener("click", () => {
        if (option.id === "left") rotate -= 90;
        else if (option.id === "right") rotate += 90;
        else if (option.id === "horizontal") flipHorizontal *= -1;
        else flipVertical *= -1;
        applyFilter();
    });
});

// Reset Filters
const resetFilter = () => {
    brightness = saturation = 100;
    inversion = grayscale = blur = vignette = 0;
    rotate = 0;
    flipHorizontal = flipVertical = 1;
    document.querySelector(".active").classList.remove("active");
    filterOptions[0].classList.add("active"); // Set default active filter
    applyFilter();
};

// Download Image
downloadImageBtn.addEventListener("click", () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = previewImg.naturalWidth;
    canvas.height = previewImg.naturalHeight;

    ctx.filter = previewImg.style.filter;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(flipHorizontal, flipVertical);
    ctx.rotate((rotate * Math.PI) / 180);
    ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

    // Add vignette effect to the canvas
    const vignetteRadius = vignette * 20;
    if (vignette > 0) {
        const gradient = ctx.createRadialGradient(
            canvas.width / 2,
            canvas.height / 2,
            canvas.width / 4,
            canvas.width / 2,
            canvas.height / 2,
            vignetteRadius
        );
        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)");
        ctx.fillStyle = gradient;
        ctx.fillRect(-canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    }

    // Download image
    const link = document.createElement("a");
    link.download = "edited-image.jpg";
    link.href = canvas.toDataURL();
    link.click();
});

// Event Listeners
resetFilterBtn.addEventListener("click", resetFilter);
chooseImgBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", loadImage);
