import { API_AI } from "@/services/api";

const analysis = async (uri) => {
    try {
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      const Api = `${API_AI}/predict`;
      console.log('API URL:', Api);

      let formData = new FormData();
      formData.append('file', {
        uri: uri,
        name: `photo.${fileType}`,
        type: `image/${fileType}`,
      });

      let response = await fetch(Api, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const ClassNames = {
        0: "Good Rice",
        1: "Broken Rice"
      };

      const json = await response.json();
      const classCounts = {};

      // Loop through predictions to count classes
      json.predictions.forEach(prediction => {
        const classLabel = prediction[5]; // ใช้ index [5] เพื่อเข้าถึง class_id
        if (classCounts[classLabel]) {
          classCounts[classLabel] += 1;
        } else {
          classCounts[classLabel] = 1;
        }
      });
  
      // Calculate total number of predictions
      const total = Object.values(classCounts).reduce((sum, count) => sum + count, 0);
  
      // Create a message for each class
      const message = Object.entries(classCounts)
        .map(([classId, count]) => `${ClassNames[classId] || `Class ID ${classId}`}: ${count}`)
        .join('\n');
  
      // Calculate the percentage of good rice
      const goodRicePercentage = ((classCounts[0] || 0) / total * 100).toFixed(2);
      //const goodRicePercentage = total > 0 ? (classCounts[0] || 0) / total * 100 : 0;
      const summary = `คุณภาพการสี: ${goodRicePercentage}%`;
      
      if (!isNaN(goodRicePercentage)) {
        //console.log('Summary:', summary);
        return goodRicePercentage;
      }else {
        throw new Error('Invalid result calculated');
      }
    } catch (error) {
      console.error('Error uploading image:', error.message);
    }


}

export default analysis;