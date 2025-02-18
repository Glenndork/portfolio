const bastionImages = ["assets/bastion-1.png", "assets/bastion-2.png", "assets/bastion-3.png"];
const nioImages = ["assets/nio-1.png", "assets/nio-2.png", "assets/nio-3.png"];
let bastionIndex = 0;
let nioIndex = 0;

function updateImage(id, images, index) {
    const imgElement = document.getElementById(id + "-image");
    imgElement.classList.remove("fade-active");
    setTimeout(() => {
        imgElement.src = images[index];
        imgElement.classList.add("fade-active");
    }, 100);
}

function prevSlide(id) {
    if (id === "bastion") {
        bastionIndex = (bastionIndex > 0) ? bastionIndex - 1 : bastionImages.length - 1;
        updateImage("bastion", bastionImages, bastionIndex);
    } else {
        nioIndex = (nioIndex > 0) ? nioIndex - 1 : nioImages.length - 1;
        updateImage("nio", nioImages, nioIndex);
    }
}

function nextSlide(id) {
    if (id === "bastion") {
        bastionIndex = (bastionIndex < bastionImages.length - 1) ? bastionIndex + 1 : 0;
        updateImage("bastion", bastionImages, bastionIndex);
    } else {
        nioIndex = (nioIndex < nioImages.length - 1) ? nioIndex + 1 : 0;
        updateImage("nio", nioImages, nioIndex);
    }
}