import {
  Box,
  Heading,
  Icon,
  IconButton,
  chakra,
  Flex,
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Tfoot,
  HStack,
  Button,
} from "@chakra-ui/react";
import React from "react";
import { useTranslation } from "react-i18next";
import { MultiLangValue, SortableList } from "~/components/ui";
import { useRouter } from "~/hooks";
import { moduleRootPath } from "../moduleConfig";
import { HiOutlineTrash } from "react-icons/hi";
import { FiEdit } from "react-icons/fi";
import { GrDrag } from "react-icons/gr";

export const TourStopListing = ({
  data,
  onSortUpdate,
}: {
  data: any;
  onSortUpdate: (items: any) => void;
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  let stops = data?.tourRead?.tourStops
    ? data?.tourRead?.tourStops.map((stop: any) => {
        return {
          id: `stop-${stop.id}`,
          tourStopId: stop.id,
          currentNumber: stop.number,
          content: (
            <Flex
              w="100%"
              borderTop="1px solid"
              borderColor="gray.600"
              justifyContent="space-between"
              py="2"
              alignItems="center"
              bg="white"
            >
              <chakra.span w="60px" pl="0">
                <Icon as={GrDrag} w="5" height="5" mr="1" />
              </chakra.span>
              <chakra.span w="120px" pl="0">
                {stop.number}
              </chakra.span>
              <chakra.span pl="0" flexGrow={10}>
                <MultiLangValue json={stop.title} />
              </chakra.span>
              <Box w="150px" px="0">
                <Flex justifyContent="center">
                  <HStack mx="auto">
                    <IconButton
                      aria-label={t(
                        "module.tour.table.tourstops.delete",
                        "Delete tour stop"
                      )}
                      fontSize="xl"
                      colorScheme="red"
                      variant="outline"
                      icon={<HiOutlineTrash />}
                      onClick={() => {}}
                    />

                    <IconButton
                      aria-label={t(
                        "module.tour.table.tourstops.update",
                        "Update tour stop"
                      )}
                      variant="outline"
                      icon={<FiEdit />}
                      fontSize="xl"
                      onClick={() => {
                        router.push(
                          `${moduleRootPath}/${router.query.tourId}/update/${stop.id}/`
                        );
                      }}
                    />
                  </HStack>
                </Flex>
              </Box>
            </Flex>
          ),
        };
      })
    : [];

  stops = stops.sort((a: any, b: any) => {
    if (a.currentNumber > b.currentNumber) return 1;
    if (a.currentNumber < b.currentNumber) return -1;

    return 0;
  });
  return (
    <Box>
      <Heading as="h2" mb="3" mt="10">
        {t("module.tour.heading.tourStops", "Tour stops")}
      </Heading>
      <Table position="relative" w="100%">
        <Thead>
          <Tr>
            <Th w="30px"></Th>

            <Th
              w="120px"
              pl="0"
              borderColor="gray.300"
              fontSize="md"
              color="gray.800"
            >
              {t("module.tour.table.tourstops.title", "Number")}
            </Th>
            <Th pl="0" borderColor="gray.300" fontSize="md" color="gray.800">
              {t("module.tour.table.tourstops.title", "Title")}
            </Th>
            <Th
              w="150px"
              textAlign="center"
              px="0"
              borderColor="gray.300"
              fontSize="md"
              color="gray.800"
              _last={{
                position: "sticky",
                right: 0,
                p: 0,
                "> div": {
                  p: 4,
                  h: "100%",
                  bg: "rgba(255,255,255,0.9)",
                },
              }}
            >
              {t("table.label.actions", "Actions")}
            </Th>
          </Tr>
        </Thead>
      </Table>
      {stops.length === 0 && (
        <Table>
          <Tbody>
            <Tr>
              <Td pl="0" colSpan={4}>
                {t(
                  "module.tour.table.tourstops.empty",
                  "This tour has currently no stops."
                )}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      )}

      {stops.length > 0 && (
        <Box borderBottom="1px solid" borderColor="gray.600">
          <SortableList items={stops} onSortUpdate={onSortUpdate} />
        </Box>
      )}
      <Table>
        <Tfoot>
          <Tr>
            <Td px="0" colSpan={4}>
              <Button
                onClick={() => {
                  router.push(
                    `${moduleRootPath}/${router.query.tourId}/create`
                  );
                }}
              >
                {t("module.tour.table.tourstops.button.add", "Add tour stop")}
              </Button>
            </Td>
          </Tr>
        </Tfoot>
      </Table>
    </Box>
  );
};
