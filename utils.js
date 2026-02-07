// Image compression
async function compressImage(file, maxSizeMB = 1) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                const maxDim = 1200;
                if (width > height && width > maxDim) {
                    height = (height / width) * maxDim;
                    width = maxDim;
                } else if (height > maxDim) {
                    width = (width / height) * maxDim;
                    height = maxDim;
                }
                
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                
                let quality = 0.8;
                let result = canvas.toDataURL('image/jpeg', quality);
                while (result.length > maxSizeMB * 1024 * 1024 && quality > 0.1) {
                    quality -= 0.1;
                    result = canvas.toDataURL('image/jpeg', quality);
                }
                resolve(result);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Condition colors
function getConditionColor(condition) {
    const colors = {
        'good': 'bg-green-100 text-green-800 border-green-300',
        'medium': 'bg-yellow-100 text-yellow-800 border-yellow-300',
        'bad': 'bg-orange-100 text-orange-800 border-orange-300',
        'RIP': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
}

// Size colors
function getSizeColor(size) {
    const colors = {
        'very-small': 'bg-blue-100 text-blue-800',
        'small': 'bg-cyan-100 text-cyan-800',
        'medium': 'bg-indigo-100 text-indigo-800',
        'large': 'bg-purple-100 text-purple-800'
    };
    return colors[size] || 'bg-gray-100 text-gray-800';
}

// Calculate age
function calculateAge(plantDate) {
    if (!plantDate) return 'Unknown';
    const days = Math.ceil(Math.abs(new Date() - new Date(plantDate)) / (1000 * 60 * 60 * 24));
    if (days < 30) return `${days} days`;
    if (days < 365) return `${Math.floor(days / 30)} months`;
    return `${Math.floor(days / 365)} years`;
}
