import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Box } from "@chakra-ui/react";

const reorder = (list: any, startIndex: any, endIndex: any) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

export const SortableList = ({
  items,
  onSortUpdate,
}: {
  items: any[];
  onSortUpdate?: (items: any) => void;
}) => {
  const [storedItems, setStoredItems] = useState({ items });
  const [isUpdating, setIsUpdating] = useState(false);
  const onDragEnd = async (result: any) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const orderedItems = reorder(
      storedItems.items,
      result.source.index,
      result.destination.index
    );

    setStoredItems({ items: orderedItems });

    if (typeof onSortUpdate === "function") {
      try {
        setIsUpdating(true);
        await onSortUpdate.call(null, orderedItems);

      } catch(err: any) {}
      finally {
        setIsUpdating(false);
      }
    }
  };

  return (
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable">
          {(provided, doppableSnapshot) => (
            <Box {...provided.droppableProps} ref={provided.innerRef}>
              {storedItems.items.map((item, index) => (
                <Draggable key={item.id} draggableId={item.id} index={index} isDragDisabled={isUpdating}>
                  {(provided, snapshot) => (
                    <Box
                      key={item.id}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      opacity={
                        !snapshot.isDragging && doppableSnapshot.isDraggingOver
                          ? 0.6
                          : 1
                      }
                      className={snapshot.isDragging ? "is-dragged" : ""}
                      borderBottom={snapshot.isDragging? "1px solid #888" : "1px solid white"}
                    >
                      {typeof item.content === "function" ? item.content.call(null, {index}) : item.content}
                    </Box>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
  );
};
