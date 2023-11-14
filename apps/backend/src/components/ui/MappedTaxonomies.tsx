import { useQuery } from "@apollo/client";
import { taxonomiesQueryGQL } from "@culturemap/core";
import { Box, Flex } from "@chakra-ui/react";
import { MultiLangValue } from "~/components/ui";
import { useTranslation } from "react-i18next";

import { HiOutlineArrowRight } from "react-icons/hi";

const options = [
  "typeOfInstitution",
  "typeOfOrganisation",
  "targetAudience",
  "eventType",
  "accessibility",
];

export const MappedTaxonomies = ({ ...props }: { props: any }) => {
  const { t, i18n } = useTranslation();
  const { data } = useQuery(taxonomiesQueryGQL, {
    variables: {
      orderBy: {
        [`name_${i18n.language}`]: "asc",
      },
    },
  });

  if (!data?.taxonomies?.taxonomies) return <></>;

  return (
    <Box borderBottom="1px solid" borderColor="gray.300" pb="2" mt="2">
      {options.map((o) => {
        const value = data?.taxonomies?.taxonomies.reduce(
          (acc: any, t: any) => {
            if (t.id.toString() === (props as any)[o]) return t.name;

            return acc;
          },
          {}
        );
        return (
          <Flex
            key={`tax-${o}`}
            borderTop="1px solid"
            borderColor="gray.300"
            pt="2"
            alignItems="center"
          >
            <Box w="25%" minW="200px">
              <b>{t(`settings.taxMapping.options.label.${o}`)}</b>
            </Box>
            <Box px="3">
              <HiOutlineArrowRight />
            </Box>
            <Box>
              {value ? (
                <MultiLangValue json={value} />
              ) : (
                t(
                  "settings.empty.defaultvalue",
                  "Empty! Please update the settings"
                )
              )}
            </Box>
          </Flex>
        );
      })}
    </Box>
  );
};
