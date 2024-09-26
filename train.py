import tensorflow as tf
from tensorflow.keras import layers, models
from datasets import load_dataset
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt

# Constants
BATCH_SIZE = 32
IMG_SIZE = (224, 224)
EPOCHS = 50  # Number of epochs for training

# Load the Food101 dataset from Hugging Face
dataset = load_dataset("ethz/food101", split="train[:100%]")

# Check the structure of a sample
print(dataset[0])

# Function to preprocess images and labels
def preprocess(example):
    # Convert the image to a NumPy array (if it's not already)
    image = np.array(example['image'])

    # Resize the image
    image = tf.image.resize(image, IMG_SIZE)
    
    # One-hot encode the label
    label = tf.one_hot(example['label'], 101)
    
    # Return as a dictionary
    return {'image': image, 'label': label}

# Apply preprocessing to the dataset
dataset = dataset.map(preprocess)

# Convert to TensorFlow Dataset
tf_dataset = dataset.to_tf_dataset(
    columns=['image'], 
    label_cols=['label'],
    batch_size=BATCH_SIZE,
    shuffle=True
)

# Split into train and validation sets (80-20 split)
train_size = 0.8
train_dataset, val_dataset = train_test_split(list(tf_dataset), test_size=(1 - train_size))

# Data augmentation for better generalization
data_augmentation = models.Sequential([
    layers.RandomFlip("horizontal_and_vertical"),
    layers.RandomRotation(0.2),
])

# Preprocessing input for MobileNetV2
preprocess_input = tf.keras.applications.mobilenet_v2.preprocess_input

# Load the base model (MobileNetV2 pre-trained on ImageNet)
base_model = tf.keras.applications.MobileNetV2(
    input_shape=IMG_SIZE + (3,),
    include_top=False,
    weights='imagenet'
)

# Freeze the base model
base_model.trainable = False

# Build the model
model = models.Sequential([
    data_augmentation,                         # Data augmentation
    preprocess_input,                          # Preprocess input
    base_model,                                # Pre-trained base model
    layers.GlobalAveragePooling2D(),           # Global pooling layer
    layers.Dropout(0.2),                       # Dropout for regularization
    layers.Dense(101, activation='softmax')    # Output layer for 101 classes
])

# Compile the model
model.compile(optimizer=tf.keras.optimizers.Adam(),
              loss='categorical_crossentropy',
              metrics=['accuracy'])

# Summary of the model
model.summary()

# Train the model
history = model.fit(
    tf.data.Dataset.from_tensor_slices(train_dataset).batch(BATCH_SIZE),
    validation_data=tf.data.Dataset.from_tensor_slices(val_dataset).batch(BATCH_SIZE),
    epochs=EPOCHS
)

# Save the trained model
model.save('food101_model_hf.h5')

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
