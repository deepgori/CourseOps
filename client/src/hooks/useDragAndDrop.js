export const useDragAndDrop = ({ onStatusChange }) => {
  const handleDragEnd = async (result) => {
    const { destination, draggableId, source } = result;

    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    await onStatusChange(draggableId, destination.droppableId);
  };

  return { handleDragEnd };
};

