import os
import tensorflow as tf
from tensorflow.keras import layers, models
from tensorflow.keras.preprocessing import image_dataset_from_directory
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Ensure Kaggle credentials are in place
if not os.path.exists(os.path.expanduser('~/.kaggle/kaggle.json')):
    raise FileNotFoundError('Kaggle API credentials not found. Please ensure kaggle.json is in ~/.kaggle/')

# Download the Food-101 dataset from Kaggle
os.system("kaggle datasets download -d dansbecker/food-101 -p ./")

# Unzip the dataset
os.system("unzip -q ./food-101.zip -d ./")

# Set paths
DATASET_DIR = './food-101/images/'
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 50  # You requested 50 epochs

# Load dataset and split into train and validation sets
dataset = image_dataset_from_directory(
    DATASET_DIR, 
    image_size=IMG_SIZE, 
    batch_size=BATCH_SIZE,
    label_mode='categorical'
)

# Split dataset into training and validation (80-20 split)
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size
train_dataset = dataset.take(train_size)
val_dataset = dataset.skip(train_size)

# Data augmentation to improve model generalization
data_augmentation = models.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
])

# Preprocess input for MobileNetV2
preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input

# Build the base model from MobileNetV2 pre-trained on ImageNet
base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights='imagenet'
)

# Freeze the base model layers
base_model.trainable = False

# Build the model
model = models.Sequential([
    data_augmentation,                        # Data augmentation layer
    preprocess_input,                         # Preprocessing layer
    base_model,                               # Pre-trained base model
    layers.GlobalAveragePooling2D(),          # Global pooling
    layers.Dropout(0.2),                      # Dropout for regularization
    layers.Dense(101, activation='softmax')   # Output layer for 101 classes
])

# Compile the model
model.compile(optimizer=tf.keras.optimizers.Adam(),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Summary of the model
model.summary()

# Training the model
history = model.fit(
    train_dataset,
    validation_data=val_dataset,
    epochs=EPOCHS
)

# Save the trained model
model.save('food101_model.h5')

# Plot training & validation accuracy and loss
def plot_history(history):
    acc = history.history['accuracy']
    val_acc = history.history['val_accuracy']
    loss = history.history['loss']
    val_loss = history.history['val_loss']

    plt.figure(figsize=(8, 8))
    plt.subplot(1, 2, 1)
    plt.plot(acc, label='Training Accuracy')
    plt.plot(val_acc, label='Validation Accuracy')
    plt.legend(loc='lower right')
    plt.title('Training and Validation Accuracy')

    plt.subplot(1, 2, 2)
    plt.plot(loss, label='Training Loss')
    plt.plot(val_loss, label='Validation Loss')
    plt.legend(loc='upper right')
    plt.title('Training and Validation Loss')
    plt.savefig('training_validation_accuracy_loss.png')
    plt.show()

# Plot and save the training history
plot_history(history)
