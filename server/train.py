import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
import matplotlib.pyplot as plt
import os
import numpy as np
import requests
import tarfile
from tqdm import tqdm

# constants
IMG_HEIGHT, IMG_WIDTH = 224, 224
BATCH_SIZE = 512  # Adjusted batch size
EPOCHS = 20  # Increased epochs for better training
NUM_CLASSES = 101  # Using all 101 classes

# Function to download and extract the dataset
def download_and_extract_dataset(url, target_dir):
    if not os.path.exists(target_dir):
        os.makedirs(target_dir)
    
    tar_file_path = os.path.join(target_dir, "food-101.tar.gz")
    
    if not os.path.exists(tar_file_path):
        print("Downloading dataset...")
        response = requests.get(url, stream=True)
        total_size = int(response.headers.get('content-length', 0))
        
        with open(tar_file_path, "wb") as file, tqdm(
            desc="Downloading",
            total=total_size,
            unit="iB",
            unit_scale=True,
            unit_divisor=1024,
        ) as progress_bar:
            for data in response.iter_content(chunk_size=1024):
                size = file.write(data)
                progress_bar.update(size)
    
    if not os.path.exists(os.path.join(target_dir, "food-101")):
        print("Extracting dataset...")
        with tarfile.open(tar_file_path, "r:gz") as tar:
            tar.extractall(path=target_dir)
    
    print("Dataset ready!")

# Download and extract the dataset
dataset_url = "http://data.vision.ee.ethz.ch/cvl/food-101.tar.gz"
dataset_dir = "food-101_dataset"
download_and_extract_dataset(dataset_url, dataset_dir)

# Prepare the data
data_dir = os.path.join(dataset_dir, "food-101", "images")
classes = sorted(os.listdir(data_dir))[:NUM_CLASSES]  # Get the first NUM_CLASSES classes

train_data = []
val_data = []

for class_name in classes:
    class_dir = os.path.join(data_dir, class_name)
    images = os.listdir(class_dir)
    train_images = images[:750]  # First 750 images for training
    val_images = images[750:750 + 250]  # Next 250 images for validation
    
    train_data.extend([(os.path.join(class_name, img), class_name) for img in train_images])
    val_data.extend([(os.path.join(class_name, img), class_name) for img in val_images])

# Set up data generators
train_datagen = ImageDataGenerator(
    rescale=1./255,
    rotation_range=20,
    width_shift_range=0.2,
    height_shift_range=0.2,
    shear_range=0.2,
    zoom_range=0.2,
    horizontal_flip=True,
    fill_mode='nearest'
)

validation_datagen = ImageDataGenerator(rescale=1./255)

def generate_data(data, batch_size):
    num_samples = len(data)
    while True:
        # Shuffle the data at the start of each epoch
        np.random.shuffle(data)
        for offset in range(0, num_samples, batch_size):
            batch = data[offset:offset + batch_size]
            batch_images = []
            batch_labels = []
            for image_name, label in batch:
                img = tf.keras.preprocessing.image.load_img(
                    os.path.join(data_dir, image_name), 
                    target_size=(IMG_HEIGHT, IMG_WIDTH)
                )
                img = tf.keras.preprocessing.image.img_to_array(img)
                batch_images.append(img)
                batch_labels.append(classes.index(label))
            batch_images = np.array(batch_images) / 255.0
            batch_labels = tf.keras.utils.to_categorical(batch_labels, num_classes=NUM_CLASSES)
            yield batch_images, batch_labels

train_generator = generate_data(train_data, BATCH_SIZE)
validation_generator = generate_data(val_data, BATCH_SIZE)

# transfer learning
base_model = tf.keras.applications.MobileNetV2(
    input_shape=(IMG_HEIGHT, IMG_WIDTH, 3),
    include_top=False,
    weights='imagenet'
)

model = models.Sequential([
    base_model,
    layers.GlobalAveragePooling2D(),
    layers.Dropout(0.5),  # Added dropout for regularization
    layers.Dense(NUM_CLASSES, activation='softmax')
])

# Compile
model.compile(optimizer='adam',
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Define callbacks
early_stopping = EarlyStopping(
    monitor='val_loss',
    patience=10,  # Increased patience
    restore_best_weights=True
)

reduce_lr = ReduceLROnPlateau(
    monitor='val_loss',
    factor=0.2,
    patience=3,
    min_lr=1e-6
)

model_checkpoint = ModelCheckpoint(
    'best_model.keras',
    monitor='val_loss',
    save_best_only=True
)

# Train
history = model.fit(
    train_generator,
    steps_per_epoch=len(train_data) // BATCH_SIZE,
    epochs=EPOCHS,
    validation_data=validation_generator,
    validation_steps=len(val_data) // BATCH_SIZE,
    callbacks=[early_stopping, reduce_lr, model_checkpoint]
)

# Plot training results
acc = history.history['accuracy']
val_acc = history.history['val_accuracy']
loss = history.history['loss']
val_loss = history.history['val_loss']

epochs_range = range(len(acc))

plt.figure(figsize=(12, 4))
plt.subplot(1, 2, 1)
plt.plot(epochs_range, acc, label='Training Accuracy')
plt.plot(epochs_range, val_acc, label='Validation Accuracy')
plt.legend(loc='lower right')
plt.title('Training and Validation Accuracy')

plt.subplot(1, 2, 2)
plt.plot(epochs_range, loss, label='Training Loss')
plt.plot(epochs_range, val_loss, label='Validation Loss')
plt.legend(loc='upper right')
plt.title('Training and Validation Loss')
plt.savefig('training_history.png')
plt.close()

# Save the model
model_save_path = 'food_recognition_model.h5'
model.save(model_save_path)
print(f"Model saved to {model_save_path}")

# Save the class names
class_names_file = 'class_names.txt'
with open(class_names_file, 'w') as f:
    for class_name in classes:
        f.write(f"{class_name}\n")
print(f"Class names saved to {class_names_file}")

print("Training complete. Model and class names have been saved.")
